from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import numpy as np
from PIL import Image

from app.core.config import get_settings
from app.schemas.process import FaceBox, ProcessResponse, ProcessResultItem, ProcessingOptions, ProcessingPaths
from app.services.cropping import ImageSize, expand_and_clip_face_box
from app.services.errors import BadRequestError, InternalProcessingError
from app.services.image_loading import load_image_bgr
from app.services.output_writer import build_output_filename, ensure_collision_safe_path

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DetectedFace:
    bbox: tuple[int, int, int, int]
    embedding: np.ndarray
    det_score: float | None = None

    @property
    def area(self) -> int:
        left, top, right, bottom = self.bbox
        return max(0, right - left) * max(0, bottom - top)

    def to_face_box(self) -> FaceBox:
        left, top, right, bottom = self.bbox
        return FaceBox(top=top, right=right, bottom=bottom, left=left)


@dataclass(frozen=True)
class MatchResult:
    face: DetectedFace
    score: float


class FaceEngine(Protocol):
    def detect_faces(self, image: np.ndarray) -> list[DetectedFace]: ...


class InsightFaceEngine:
    def __init__(self) -> None:
        self._app = None

    def _get_app(self):
        if self._app is None:
            try:
                from insightface.app import FaceAnalysis
            except ImportError as exc:
                raise InternalProcessingError(
                    "face_engine_unavailable",
                    "InsightFace dependencies are not installed.",
                ) from exc

            settings = get_settings()
            app = FaceAnalysis(
                name=settings.insightface_model_name,
                providers=list(settings.insightface_allowed_providers),
            )
            app.prepare(ctx_id=0, det_size=settings.insightface_detection_size)
            self._app = app
        return self._app

    def detect_faces(self, image: np.ndarray) -> list[DetectedFace]:
        app = self._get_app()
        try:
            faces = app.get(image)
        except Exception as exc:  # pragma: no cover - third-party runtime failures
            raise InternalProcessingError(
                "face_detection_failed",
                "Face detection failed during processing.",
            ) from exc

        detected_faces: list[DetectedFace] = []
        for face in faces:
            raw_bbox = face.bbox.tolist()
            bbox_values = (
                int(round(raw_bbox[0])),
                int(round(raw_bbox[1])),
                int(round(raw_bbox[2])),
                int(round(raw_bbox[3])),
            )
            embedding = np.asarray(face.embedding, dtype=np.float32)
            if embedding.size == 0:
                continue
            detected_faces.append(
                DetectedFace(
                    bbox=bbox_values,
                    embedding=embedding,
                    det_score=float(face.det_score) if getattr(face, "det_score", None) is not None else None,
                )
            )
        return detected_faces


class ProcessService:
    def __init__(self, *, face_engine: FaceEngine | None = None) -> None:
        self._face_engine = face_engine or InsightFaceEngine()

    def process_paths(self, paths: ProcessingPaths, options: ProcessingOptions) -> ProcessResponse:
        logger.info(
            "processing started",
            extra={"total_images": len(paths.candidate_images), "output_dir": str(paths.output_dir), "run_id": paths.run_id},
        )

        target_image = load_image_bgr(paths.target_image, code_prefix="target_image")
        target_faces = self._face_engine.detect_faces(target_image)
        if not target_faces:
            raise BadRequestError("no_target_face", "No face detected in the target image.")
        if len(target_faces) > 1:
            logger.warning("multiple target faces detected; using largest face")

        target_face = self._select_largest_face(target_faces)

        results: list[ProcessResultItem] = []
        detected_faces = 0
        matched_faces = 0

        for candidate_path in paths.candidate_images:
            candidate_image = load_image_bgr(candidate_path, code_prefix="candidate_image")
            candidate_faces = self._face_engine.detect_faces(candidate_image)
            detected_faces += len(candidate_faces)

            best_match = self._find_best_match(target_face, candidate_faces, options.threshold)
            if best_match is None:
                continue

            saved_path = self._save_crop(
                source_path=candidate_path,
                output_dir=paths.output_dir,
                image=candidate_image,
                face=best_match.face,
                padding=options.padding,
            )
            matched_faces += 1
            results.append(
                ProcessResultItem(
                    sourceFilename=candidate_path.name,
                    savedPath=str(saved_path),
                    faceBox=best_match.face.to_face_box(),
                    matchScore=best_match.score,
                )
            )

        logger.info(
            "processing completed",
            extra={
                "total_images": len(paths.candidate_images),
                "matched_faces": matched_faces,
                "output_dir": str(paths.output_dir),
                "run_id": paths.run_id,
            },
        )
        return ProcessResponse(
            totalImages=len(paths.candidate_images),
            detectedFaces=detected_faces,
            matchedFaces=matched_faces,
            runId=paths.run_id,
            outputDirectory=str(paths.output_dir),
            results=results,
        )

    def _select_largest_face(self, faces: list[DetectedFace]) -> DetectedFace:
        return max(faces, key=lambda face: face.area)

    def _find_best_match(
        self,
        target_face: DetectedFace,
        candidate_faces: list[DetectedFace],
        threshold: float,
    ) -> MatchResult | None:
        best_result: MatchResult | None = None
        for candidate_face in candidate_faces:
            score = cosine_similarity(target_face.embedding, candidate_face.embedding)
            if score < threshold:
                continue
            if best_result is None or score > best_result.score:
                best_result = MatchResult(face=candidate_face, score=score)
        return best_result

    def _save_crop(
        self,
        *,
        source_path: Path,
        output_dir: Path,
        image: np.ndarray,
        face: DetectedFace,
        padding: int,
    ) -> Path:
        face_box = face.to_face_box()
        image_size = ImageSize(width=image.shape[1], height=image.shape[0])
        crop_bounds = expand_and_clip_face_box(face_box, image_size=image_size, padding=padding)
        cropped = image[crop_bounds.top:crop_bounds.bottom, crop_bounds.left:crop_bounds.right]
        if cropped.size == 0:
            raise InternalProcessingError("invalid_crop", "Failed to crop the matched face image.")

        output_name = build_output_filename(source_path)
        output_path = ensure_collision_safe_path(output_dir, output_name)
        rgb_image = cropped[:, :, ::-1]
        Image.fromarray(rgb_image).save(output_path)
        return output_path


def cosine_similarity(left: np.ndarray, right: np.ndarray) -> float:
    left_norm = np.linalg.norm(left)
    right_norm = np.linalg.norm(right)
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return float(np.dot(left, right) / (left_norm * right_norm))
