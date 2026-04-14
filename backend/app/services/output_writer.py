from pathlib import Path


def build_output_filename(source_path: Path, *, index: int = 1) -> str:
    stem = source_path.stem or "image"
    suffix = source_path.suffix.lower() or ".png"
    return f"{stem}_face_{index:02d}{suffix}"


def ensure_collision_safe_path(output_dir: Path, base_name: str) -> Path:
    candidate = output_dir / base_name
    if not candidate.exists():
        return candidate

    stem = candidate.stem
    suffix = candidate.suffix
    counter = 1
    while True:
        retry = output_dir / f"{stem}_{counter}{suffix}"
        if not retry.exists():
            return retry
        counter += 1
