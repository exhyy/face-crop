from __future__ import annotations

from dataclasses import dataclass

from app.schemas.process import FaceBox


@dataclass(frozen=True)
class CropBounds:
    left: int
    top: int
    right: int
    bottom: int

    @property
    def width(self) -> int:
        return self.right - self.left

    @property
    def height(self) -> int:
        return self.bottom - self.top


@dataclass(frozen=True)
class ImageSize:
    width: int
    height: int


def expand_and_clip_face_box(face_box: FaceBox, *, image_size: ImageSize, padding: int) -> CropBounds:
    left = max(0, face_box.left - padding)
    top = max(0, face_box.top - padding)
    right = min(image_size.width, face_box.right + padding)
    bottom = min(image_size.height, face_box.bottom + padding)

    if right <= left:
        right = min(image_size.width, left + 1)
    if bottom <= top:
        bottom = min(image_size.height, top + 1)

    return CropBounds(left=left, top=top, right=right, bottom=bottom)
