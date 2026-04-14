import logging
from pathlib import Path

from PIL import Image

from app.schemas.process import ProcessRequest, ProcessResponse, ProcessResultItem, ProcessingPaths
from app.services.cropping import build_placeholder_face_box
from app.services.errors import BadRequestError
from app.services.image_loading import (
    ensure_existing_directory,
    ensure_existing_file,
    ensure_supported_image_file,
    verify_readable_image,
)
from app.services.output_writer import build_output_filename, ensure_collision_safe_path

logger = logging.getLogger(__name__)


class ProcessService:
    def process(self, request: ProcessRequest) -> ProcessResponse:
        paths = self._validate_paths(request)
        logger.info(
            "processing started",
            extra={"total_images": len(paths.candidate_images), "output_dir": str(paths.output_dir)},
        )

        target_width, target_height = verify_readable_image(paths.target_image, code_prefix="target_image")
        if target_width <= 0 or target_height <= 0:
            raise BadRequestError("invalid_target_image", "Target image has invalid dimensions.")

        results: list[ProcessResultItem] = []
        detected_faces = 0
        matched_faces = 0

        for candidate_path in paths.candidate_images:
            width, height = verify_readable_image(candidate_path, code_prefix="candidate_image")
            detected_faces += 1
            matched_faces += 1
            saved_path = self._write_placeholder_copy(candidate_path, paths.output_dir)
            results.append(
                ProcessResultItem(
                    sourceFilename=candidate_path.name,
                    savedPath=str(saved_path),
                    faceBox=build_placeholder_face_box(width, height, request.padding),
                )
            )

        logger.info(
            "processing completed",
            extra={
                "total_images": len(paths.candidate_images),
                "matched_faces": matched_faces,
                "output_dir": str(paths.output_dir),
            },
        )
        return ProcessResponse(
            totalImages=len(paths.candidate_images),
            detectedFaces=detected_faces,
            matchedFaces=matched_faces,
            results=results,
        )

    def _validate_paths(self, request: ProcessRequest) -> ProcessingPaths:
        target_image = ensure_supported_image_file(
            ensure_existing_file(Path(request.targetImagePath).expanduser(), field_name="target_image"),
            code_prefix="target_image",
        )
        output_dir = ensure_existing_directory(Path(request.outputDir).expanduser())

        candidate_images: list[Path] = []
        for value in request.candidateImagePaths:
            candidate_path = ensure_supported_image_file(
                ensure_existing_file(Path(value).expanduser(), field_name="candidate_image"),
                code_prefix="candidate_image",
            )
            candidate_images.append(candidate_path)

        return ProcessingPaths(
            target_image=target_image,
            candidate_images=candidate_images,
            output_dir=output_dir,
        )

    def _write_placeholder_copy(self, source_path: Path, output_dir: Path) -> Path:
        output_name = build_output_filename(source_path)
        output_path = ensure_collision_safe_path(output_dir, output_name)

        with Image.open(source_path) as image:
            image.save(output_path)

        return output_path
