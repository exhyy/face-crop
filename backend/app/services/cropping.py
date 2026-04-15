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


def square_face_box(face_box: FaceBox, *, image_size: ImageSize) -> FaceBox:
    width = face_box.right - face_box.left
    height = face_box.bottom - face_box.top

    if width <= 0 or height <= 0 or width == height:
        return face_box

    if width > height:
        delta = width - height
        top = face_box.top - (delta // 2)
        bottom = face_box.bottom + (delta - (delta // 2))
        if top < 0:
            bottom = min(image_size.height, bottom - top)
            top = 0
        if bottom > image_size.height:
            top = max(0, top - (bottom - image_size.height))
            bottom = image_size.height
        return FaceBox(top=top, right=face_box.right, bottom=bottom, left=face_box.left)

    delta = height - width
    left = face_box.left - (delta // 2)
    right = face_box.right + (delta - (delta // 2))
    if left < 0:
        right = min(image_size.width, right - left)
        left = 0
    if right > image_size.width:
        left = max(0, left - (right - image_size.width))
        right = image_size.width
    return FaceBox(top=face_box.top, right=right, bottom=face_box.bottom, left=left)


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
