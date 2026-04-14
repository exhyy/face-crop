from pathlib import Path

from PIL import Image, UnidentifiedImageError

from app.services.errors import BadRequestError, UnprocessableImageError
from app.utils.paths import is_supported_image_path


def ensure_existing_file(path: Path, *, field_name: str) -> Path:
    if not path.exists():
        raise BadRequestError(f"missing_{field_name}", f"{field_name.replace('_', ' ').capitalize()} does not exist.")
    if not path.is_file():
        raise BadRequestError(f"invalid_{field_name}", f"{field_name.replace('_', ' ').capitalize()} must be a file.")
    return path


def ensure_existing_directory(path: Path) -> Path:
    if not path.exists():
        raise BadRequestError("missing_output_dir", "Output directory does not exist.")
    if not path.is_dir():
        raise BadRequestError("invalid_output_dir", "Output directory must be a directory.")
    return path


def ensure_supported_image_file(path: Path, *, code_prefix: str) -> Path:
    if not is_supported_image_path(path):
        raise UnprocessableImageError(
            f"unsupported_{code_prefix}",
            f"{code_prefix.replace('_', ' ').capitalize()} must be a supported image file.",
        )
    return path


def verify_readable_image(path: Path, *, code_prefix: str) -> tuple[int, int]:
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            return image.size
    except (UnidentifiedImageError, OSError) as exc:
        raise UnprocessableImageError(
            f"invalid_{code_prefix}",
            f"{code_prefix.replace('_', ' ').capitalize()} is not a readable image.",
        ) from exc
