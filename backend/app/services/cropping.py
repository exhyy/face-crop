from app.schemas.process import FaceBox


def build_placeholder_face_box(width: int, height: int, padding: int) -> FaceBox:
    inset_x = min(width // 4, padding)
    inset_y = min(height // 4, padding)
    left = max(0, inset_x)
    top = max(0, inset_y)
    right = max(left + 1, width - inset_x)
    bottom = max(top + 1, height - inset_y)
    return FaceBox(top=top, right=right, bottom=bottom, left=left)
