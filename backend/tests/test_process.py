from pathlib import Path
from typing import cast

import numpy as np
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.face_matching import DetectedFace

client = TestClient(app)


class StubFaceEngine:
    def __init__(self, responses: list[list[DetectedFace]]) -> None:
        self._responses = responses
        self._index = 0

    def detect_faces(self, image: np.ndarray) -> list[DetectedFace]:
        response = self._responses[self._index]
        self._index += 1
        return response


def create_image(path: Path, *, size: tuple[int, int] = (24, 24), color: tuple[int, int, int] = (255, 0, 0)) -> None:
    generated_image = Image.new("RGB", size, color=cast(int | tuple[int, int, int], color))
    generated_image.save(path)


def test_process_returns_real_best_match_crop(tmp_path: Path) -> None:
    from app.api import process as process_api

    target = tmp_path / "target.jpg"
    candidate = tmp_path / "candidate.jpg"
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    create_image(target, size=(40, 40), color=(0, 255, 0))
    create_image(candidate, size=(30, 20), color=(0, 0, 255))

    original_service = process_api.service
    process_api.service = process_api.ProcessService(
        face_engine=StubFaceEngine(
            responses=[
                [
                    DetectedFace(bbox=(0, 0, 10, 10), embedding=np.array([1.0, 0.0], dtype=np.float32)),
                    DetectedFace(bbox=(0, 0, 20, 20), embedding=np.array([1.0, 0.0], dtype=np.float32)),
                ],
                [
                    DetectedFace(bbox=(2, 3, 8, 9), embedding=np.array([0.5, 0.5], dtype=np.float32)),
                    DetectedFace(bbox=(5, 4, 15, 14), embedding=np.array([1.0, 0.0], dtype=np.float32)),
                ],
            ]
        )
    )

    try:
        response = client.post(
            "/process",
            json={
                "targetImagePath": str(target),
                "candidateImagePaths": [str(candidate)],
                "outputDir": str(output_dir),
                "padding": 2,
                "threshold": 0.8,
            },
        )
    finally:
        process_api.service = original_service

    assert response.status_code == 200
    payload = response.json()
    assert payload["totalImages"] == 1
    assert payload["detectedFaces"] == 2
    assert payload["matchedFaces"] == 1
    assert payload["results"][0]["sourceFilename"] == "candidate.jpg"
    assert payload["results"][0]["matchScore"] == 1.0
    assert payload["results"][0]["faceBox"] == {"top": 4, "right": 15, "bottom": 14, "left": 5}

    saved_path = Path(payload["results"][0]["savedPath"])
    assert saved_path.exists()
    saved_image = Image.open(saved_path)
    assert saved_image.size == (14, 14)


def test_process_skips_candidate_when_best_match_below_threshold(tmp_path: Path) -> None:
    from app.api import process as process_api

    target = tmp_path / "target.jpg"
    candidate = tmp_path / "candidate.jpg"
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    create_image(target)
    create_image(candidate)

    original_service = process_api.service
    process_api.service = process_api.ProcessService(
        face_engine=StubFaceEngine(
            responses=[
                [DetectedFace(bbox=(0, 0, 10, 10), embedding=np.array([1.0, 0.0], dtype=np.float32))],
                [DetectedFace(bbox=(1, 1, 6, 6), embedding=np.array([0.0, 1.0], dtype=np.float32))],
            ]
        )
    )

    try:
        response = client.post(
            "/process",
            json={
                "targetImagePath": str(target),
                "candidateImagePaths": [str(candidate)],
                "outputDir": str(output_dir),
                "padding": 0,
                "threshold": 0.5,
            },
        )
    finally:
        process_api.service = original_service

    assert response.status_code == 200
    assert response.json() == {
        "totalImages": 1,
        "detectedFaces": 1,
        "matchedFaces": 0,
        "results": [],
    }


def test_process_returns_structured_error_for_missing_target(tmp_path: Path) -> None:
    candidate = tmp_path / "candidate.jpg"
    output_dir = tmp_path / "output"
    output_dir.mkdir()
    create_image(candidate)

    response = client.post(
        "/process",
        json={
            "targetImagePath": str(tmp_path / "missing.jpg"),
            "candidateImagePaths": [str(candidate)],
            "outputDir": str(output_dir),
            "padding": 0,
            "threshold": 0.5,
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "missing_target_image",
            "message": "Target image does not exist.",
        }
    }


def test_process_returns_structured_error_when_target_has_no_face(tmp_path: Path) -> None:
    from app.api import process as process_api

    target = tmp_path / "target.jpg"
    candidate = tmp_path / "candidate.jpg"
    output_dir = tmp_path / "output"
    output_dir.mkdir()
    create_image(target)
    create_image(candidate)

    original_service = process_api.service
    process_api.service = process_api.ProcessService(face_engine=StubFaceEngine(responses=[[], []]))

    try:
        response = client.post(
            "/process",
            json={
                "targetImagePath": str(target),
                "candidateImagePaths": [str(candidate)],
                "outputDir": str(output_dir),
                "padding": 2,
                "threshold": 0.5,
            },
        )
    finally:
        process_api.service = original_service

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "no_target_face",
            "message": "No face detected in the target image.",
        }
    }


def test_process_returns_structured_error_for_unreadable_candidate(tmp_path: Path) -> None:
    from app.api import process as process_api

    target = tmp_path / "target.jpg"
    candidate = tmp_path / "candidate.jpg"
    output_dir = tmp_path / "output"
    output_dir.mkdir()
    create_image(target)
    candidate.write_text("not an image", encoding="utf-8")

    original_service = process_api.service
    process_api.service = process_api.ProcessService(
        face_engine=StubFaceEngine(
            responses=[[DetectedFace(bbox=(0, 0, 10, 10), embedding=np.array([1.0, 0.0], dtype=np.float32))]]
        )
    )

    try:
        response = client.post(
            "/process",
            json={
                "targetImagePath": str(target),
                "candidateImagePaths": [str(candidate)],
                "outputDir": str(output_dir),
                "padding": 2,
                "threshold": 0.5,
            },
        )
    finally:
        process_api.service = original_service

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_candidate_image",
            "message": "Candidate image is not a readable image.",
        }
    }
