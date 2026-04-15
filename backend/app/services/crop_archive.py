from __future__ import annotations

import tempfile
import zipfile
from pathlib import Path

from app.services.errors import BadRequestError, InternalProcessingError


class CropArchiveService:
    def __init__(self, *, output_base_dir: Path | None = None) -> None:
        self._output_base_dir = output_base_dir

    def create_run_archive(self, run_id: str) -> Path:
        if not run_id or any(character not in 'abcdefghijklmnopqrstuvwxyz0123456789' for character in run_id):
            raise BadRequestError("invalid_run_id", "Run id is invalid.")

        base_dir = (self._output_base_dir or Path("./runs")).expanduser().resolve()
        output_dir = (base_dir / run_id / 'outputs').resolve()

        if not output_dir.exists() or not output_dir.is_dir() or base_dir not in output_dir.parents:
            raise BadRequestError("run_not_found", "Run output directory was not found.")

        crop_paths = sorted(path for path in output_dir.iterdir() if path.is_file())
        if not crop_paths:
            raise BadRequestError("no_crops_available", "No crops are available for download.")

        archive_path = Path(tempfile.gettempdir()) / f"face-search-results-{run_id}.zip"
        root_dir_name = f"face-search-results-{run_id}"

        try:
            with zipfile.ZipFile(archive_path, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
                for crop_path in crop_paths:
                    archive.write(crop_path, arcname=f"{root_dir_name}/{crop_path.name}")
        except OSError as exc:
            raise InternalProcessingError("archive_creation_failed", "Failed to create crop archive.") from exc

        return archive_path
