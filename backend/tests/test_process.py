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


def create_image_bytes(*, size: tuple[int, int] = (24, 24), color: tuple[int, int, int] = (255, 0, 0)) -> bytes:
    image = Image.new("RGB", size, color=cast(int | tuple[int, int, int], color))
    from io import BytesIO

    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_process_returns_real_best_match_crop(tmp_path: Path) -> None:
    from app.api import process as process_api
    from app.core import config as config_module

    original_service = process_api.service
    original_staging_service = process_api.staging_service
    original_settings = config_module.get_settings
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
    config_module.get_settings = lambda: config_module.Settings(service_output_base_dir=tmp_path / "runs")
    process_api.staging_service = process_api.UploadStagingService(output_base_dir=tmp_path / "runs")

    try:
        response = client.post(
            "/process",
            data={"padding": "2", "threshold": "0.8"},
            files=[
                ("targetImage", ("target.jpg", create_image_bytes(size=(40, 40), color=(0, 255, 0)), "image/jpeg")),
                ("candidateImages", ("candidate.jpg", create_image_bytes(size=(30, 20), color=(0, 0, 255)), "image/jpeg")),
            ],
        )
    finally:
        process_api.service = original_service
        process_api.staging_service = original_staging_service
        config_module.get_settings = original_settings

    assert response.status_code == 200
    payload = response.json()
    assert payload["totalImages"] == 1
    assert payload["detectedFaces"] == 2
    assert payload["matchedFaces"] == 1
    assert payload["runId"]
    assert payload["outputDirectory"].startswith(str((tmp_path / "runs").resolve()))
    assert payload["results"][0]["sourceFilename"] == "candidate.jpg"
    assert payload["results"][0]["matchScore"] == 1.0
    assert payload["results"][0]["faceBox"] == {"top": 4, "right": 15, "bottom": 14, "left": 5}

    saved_path = Path(payload["results"][0]["savedPath"])
    assert saved_path.exists()
    saved_image = Image.open(saved_path)
    assert saved_image.size == (14, 14)


def test_process_returns_structured_error_for_missing_target() -> None:
    response = client.post(
        "/process",
        data={"padding": "0", "threshold": "0.5"},
        files=[("candidateImages", ("candidate.jpg", create_image_bytes(), "image/jpeg"))],
    )

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "missing_target_image",
            "message": "Target image is required.",
        }
    }


def test_process_returns_structured_error_for_unreadable_candidate(tmp_path: Path) -> None:
    from app.api import process as process_api
    from app.core import config as config_module

    original_service = process_api.service
    original_staging_service = process_api.staging_service
    original_settings = config_module.get_settings
    process_api.service = process_api.ProcessService(
        face_engine=StubFaceEngine(
            responses=[[DetectedFace(bbox=(0, 0, 10, 10), embedding=np.array([1.0, 0.0], dtype=np.float32))]]
        )
    )
    config_module.get_settings = lambda: config_module.Settings(service_output_base_dir=tmp_path / "runs")
    process_api.staging_service = process_api.UploadStagingService(output_base_dir=tmp_path / "runs")

    try:
        response = client.post(
            "/process",
            data={"padding": "2", "threshold": "0.5"},
            files=[
                ("targetImage", ("target.jpg", create_image_bytes(), "image/jpeg")),
                ("candidateImages", ("candidate.jpg", b"not an image", "image/jpeg")),
            ],
        )
    finally:
        process_api.service = original_service
        process_api.staging_service = original_staging_service
        config_module.get_settings = original_settings

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_candidate_image",
            "message": "Candidate image is not a readable image.",
        }
    }
