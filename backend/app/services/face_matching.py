from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import numpy as np
from PIL import Image

from app.core.config import get_settings
from app.schemas.process import FaceBox, ProcessResponse, ProcessResultItem, ProcessingOptions, ProcessingPaths, TargetFaceDetectionResponse
from app.services.cropping import ImageSize, expand_and_clip_face_box, square_face_box
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


@dataclass(frozen=True)
class CandidateMatchEvaluation:
    detected_faces: int
    best_match: MatchResult | None
    matched_image: np.ndarray | None
    rotation_applied: int | None
    original_face_box: FaceBox | None


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

    def detect_target_faces(self, target_image_path: Path) -> TargetFaceDetectionResponse:
        target_image = load_image_bgr(target_image_path, code_prefix="target_image")
        target_faces = self._face_engine.detect_faces(target_image)
        if not target_faces:
            raise BadRequestError("no_target_face", "No face detected in the target image.")

        return TargetFaceDetectionResponse(
            faces=[face.to_face_box() for face in target_faces],
            defaultFaceIndex=self._select_largest_face_index(target_faces),
        )

    def process_paths(self, paths: ProcessingPaths, options: ProcessingOptions) -> ProcessResponse:
        logger.info(
            "processing started",
            extra={"total_images": len(paths.candidate_images), "output_dir": str(paths.output_dir), "run_id": paths.run_id},
        )

        target_face = self._resolve_target_face(paths.target_image, selected_index=options.selectedTargetFaceIndex)

        results: list[ProcessResultItem] = []
        detected_faces = 0
        matched_faces = 0

        for candidate_index, candidate_path in enumerate(paths.candidate_images):
            candidate_image = load_image_bgr(candidate_path, code_prefix="candidate_image")
            evaluation = self._evaluate_candidate_image(
                candidate_image=candidate_image,
                target_face=target_face,
                threshold=options.threshold,
                auto_rotate_candidates=options.autoRotateCandidates,
            )
            detected_faces += evaluation.detected_faces

            if evaluation.best_match is None or evaluation.matched_image is None:
                continue

            saved_path = self._save_crop(
                source_path=candidate_path,
                output_dir=paths.output_dir,
                image=candidate_image,
                face_box=evaluation.original_face_box,
                padding=options.padding,
            )
            matched_faces += 1
            results.append(
                ProcessResultItem(
                    candidateIndex=candidate_index,
                    sourceFilename=candidate_path.name,
                    savedPath=str(saved_path),
                    faceBox=evaluation.original_face_box,
                    matchScore=evaluation.best_match.score,
                    rotationApplied=evaluation.rotation_applied,
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

    def _detect_target_faces(self, target_image_path: Path) -> list[DetectedFace]:
        target_image = load_image_bgr(target_image_path, code_prefix="target_image")
        target_faces = self._face_engine.detect_faces(target_image)
        if not target_faces:
            raise BadRequestError("no_target_face", "No face detected in the target image.")
        return target_faces

    def _resolve_target_face(self, target_image_path: Path, *, selected_index: int | None) -> DetectedFace:
        target_faces = self._detect_target_faces(target_image_path)
        if len(target_faces) > 1 and selected_index is None:
            logger.warning("multiple target faces detected; using largest face")

        if selected_index is not None:
            if selected_index >= len(target_faces):
                raise BadRequestError("invalid_target_face_index", "Selected target face is out of range.")
            return target_faces[selected_index]

        return self._select_largest_face(target_faces)

    def _select_largest_face(self, faces: list[DetectedFace]) -> DetectedFace:
        return faces[self._select_largest_face_index(faces)]

    def _select_largest_face_index(self, faces: list[DetectedFace]) -> int:
        return max(range(len(faces)), key=lambda index: faces[index].area)

    def _evaluate_candidate_image(
        self,
        *,
        candidate_image: np.ndarray,
        target_face: DetectedFace,
        threshold: float,
        auto_rotate_candidates: bool,
    ) -> CandidateMatchEvaluation:
        detected_faces = 0
        best_match: MatchResult | None = None
        matched_image: np.ndarray | None = None
        rotation_applied: int | None = None
        original_face_box: FaceBox | None = None

        for rotation in self._rotation_attempts(auto_rotate_candidates):
            rotated_image = self._rotate_image(candidate_image, rotation)
            candidate_faces = self._face_engine.detect_faces(rotated_image)
            detected_faces += len(candidate_faces)

            rotation_match = self._find_best_match(target_face, candidate_faces, threshold)
            if rotation_match is None:
                continue

            if best_match is None or rotation_match.score > best_match.score:
                best_match = rotation_match
                matched_image = rotated_image
                rotation_applied = rotation
                original_face_box = self._square_original_face_box(
                    self._map_face_box_to_original(
                        rotation_match.face,
                        rotation=rotation,
                        original_width=candidate_image.shape[1],
                        original_height=candidate_image.shape[0],
                    ),
                    image_width=candidate_image.shape[1],
                    image_height=candidate_image.shape[0],
                )

        return CandidateMatchEvaluation(
            detected_faces=detected_faces,
            best_match=best_match,
            matched_image=matched_image,
            rotation_applied=rotation_applied,
            original_face_box=original_face_box,
        )

    def _rotation_attempts(self, auto_rotate_candidates: bool) -> tuple[int, ...]:
        if auto_rotate_candidates:
            return (0, 90, 180, 270)
        return (0,)

    def _rotate_image(self, image: np.ndarray, rotation: int) -> np.ndarray:
        if rotation == 0:
            return image
        if rotation == 90:
            return np.rot90(image, 1).copy()
        if rotation == 180:
            return np.rot90(image, 2).copy()
        if rotation == 270:
            return np.rot90(image, 3).copy()
        raise ValueError(f"Unsupported rotation angle: {rotation}")

    def _map_face_box_to_original(
        self,
        face: DetectedFace,
        *,
        rotation: int,
        original_width: int,
        original_height: int,
    ) -> FaceBox:
        left, top, right, bottom = face.bbox

        if rotation == 0:
            return face.to_face_box()
        if rotation == 90:
            return FaceBox(
                top=original_height - right,
                right=original_width - top,
                bottom=original_height - left,
                left=original_width - bottom,
            )
        if rotation == 180:
            return FaceBox(
                top=original_height - bottom,
                right=original_width - left,
                bottom=original_height - top,
                left=original_width - right,
            )
        if rotation == 270:
            return FaceBox(
                top=left,
                right=bottom,
                bottom=right,
                left=top,
            )
        raise ValueError(f"Unsupported rotation angle: {rotation}")

    def _square_original_face_box(self, face_box: FaceBox, *, image_width: int, image_height: int) -> FaceBox:
        return square_face_box(face_box, image_size=ImageSize(width=image_width, height=image_height))

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
        face_box: FaceBox,
        padding: int,
    ) -> Path:
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
