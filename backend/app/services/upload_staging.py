from __future__ import annotations

import logging
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO

from fastapi import UploadFile

from app.core.config import get_settings
from app.schemas.process import ProcessingPaths
from app.services.errors import BadRequestError, InternalProcessingError
from app.services.image_loading import ensure_supported_image_file, verify_readable_image

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class StagedRun:
    run_id: str
    run_dir: Path
    input_dir: Path
    output_dir: Path
    target_image: Path
    candidate_images: list[Path]


class UploadStagingService:
    def __init__(self, *, output_base_dir: Path | None = None) -> None:
        self._output_base_dir = output_base_dir

    def stage_uploads(
        self,
        *,
        target_image: UploadFile | None,
        candidate_images: list[UploadFile],
        require_candidates: bool = True,
    ) -> ProcessingPaths:
        if target_image is None:
            raise BadRequestError("missing_target_image", "Target image is required.")
        if require_candidates and not candidate_images:
            raise BadRequestError("missing_candidate_image", "At least one candidate image is required.")

        staged_run = self._create_run_directories()

        try:
            staged_target = self._stage_upload(target_image, staged_run.input_dir / "target", code_prefix="target_image")
            staged_candidates = [
                self._stage_upload(upload, staged_run.input_dir / "candidates", code_prefix="candidate_image")
                for upload in candidate_images
            ]
        except Exception:
            shutil.rmtree(staged_run.run_dir, ignore_errors=True)
            raise

        return ProcessingPaths(
            target_image=staged_target,
            candidate_images=staged_candidates,
            output_dir=staged_run.output_dir,
            run_id=staged_run.run_id,
        )

    def cleanup_inputs(self, paths: ProcessingPaths) -> None:
        run_dir = paths.output_dir.parent
        input_dir = run_dir / "inputs"
        shutil.rmtree(input_dir, ignore_errors=True)

    def _create_run_directories(self) -> StagedRun:
        settings = get_settings()
        base_dir = (self._output_base_dir or settings.service_output_base_dir).expanduser().resolve()
        base_dir.mkdir(parents=True, exist_ok=True)

        run_id = uuid.uuid4().hex[:12]
        run_dir = base_dir / run_id
        input_dir = run_dir / "inputs"
        output_dir = run_dir / "outputs"
        (input_dir / "target").mkdir(parents=True, exist_ok=True)
        (input_dir / "candidates").mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        return StagedRun(
            run_id=run_id,
            run_dir=run_dir,
            input_dir=input_dir,
            output_dir=output_dir,
            target_image=input_dir / "target",
            candidate_images=[],
        )

    def _stage_upload(self, upload: UploadFile, target_dir: Path, *, code_prefix: str) -> Path:
        original_name = Path(upload.filename or "upload")
        safe_name = original_name.name or f"{code_prefix}.bin"
        destination = self._ensure_unique_path(target_dir / safe_name)

        try:
            with destination.open("wb") as target:
                self._copy_upload(upload.file, target)
        except OSError as exc:
            raise InternalProcessingError("upload_staging_failed", "Failed to stage uploaded image.") from exc
        finally:
            upload.file.close()

        ensure_supported_image_file(destination, code_prefix=code_prefix)
        verify_readable_image(destination, code_prefix=code_prefix)
        return destination

    def _ensure_unique_path(self, path: Path) -> Path:
        if not path.exists():
            return path

        counter = 1
        while True:
            candidate = path.with_name(f"{path.stem}_{counter}{path.suffix}")
            if not candidate.exists():
                return candidate
            counter += 1

    def _copy_upload(self, source: BinaryIO, target: BinaryIO) -> None:
        shutil.copyfileobj(source, target)
