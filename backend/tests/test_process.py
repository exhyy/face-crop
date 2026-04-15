from pathlib import Path
from typing import Any, cast

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
        del image
        response = self._responses[self._index]
        self._index += 1
        return response


def install_process_test_services(tmp_path: Path, responses: list[list[DetectedFace]]) -> tuple[Any, Any, Any, Any, Any]:
    from app.api import process as process_api
    from app.core import config as config_module

    original_service = process_api.service
    original_staging_service = process_api.staging_service
    original_settings = config_module.get_settings

    process_api.service = process_api.ProcessService(face_engine=StubFaceEngine(responses=responses))
    config_module.get_settings = lambda: config_module.Settings(service_output_base_dir=tmp_path / "runs")
    process_api.staging_service = process_api.UploadStagingService(output_base_dir=tmp_path / "runs")

    return process_api, config_module, original_service, original_staging_service, original_settings


def restore_process_test_services(process_api: Any, config_module: Any, original_service: Any, original_staging_service: Any, original_settings: Any) -> None:
    process_api.service = original_service
    process_api.staging_service = original_staging_service
    config_module.get_settings = original_settings


def create_image_bytes(*, size: tuple[int, int] = (24, 24), color: tuple[int, int, int] = (255, 0, 0)) -> bytes:
    image = Image.new("RGB", size, color=cast(int | tuple[int, int, int], color))
    from io import BytesIO

    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_detect_target_faces_returns_all_faces_and_defaults_to_largest(tmp_path: Path) -> None:
    process_api, config_module, original_service, original_staging_service, original_settings = install_process_test_services(
        tmp_path,
        responses=[
            [
                DetectedFace(bbox=(1, 2, 9, 12), embedding=np.array([1.0, 0.0], dtype=np.float32)),
                DetectedFace(bbox=(0, 0, 20, 20), embedding=np.array([0.0, 1.0], dtype=np.float32)),
            ]
        ],
    )

    try:
        response = client.post(
            "/process/target-faces",
            files=[("targetImage", ("target.jpg", create_image_bytes(size=(40, 40)), "image/jpeg"))],
        )
    finally:
        restore_process_test_services(process_api, config_module, original_service, original_staging_service, original_settings)

    assert response.status_code == 200
    assert response.json() == {
        "faces": [
            {"top": 2, "right": 9, "bottom": 12, "left": 1},
            {"top": 0, "right": 20, "bottom": 20, "left": 0},
        ],
        "defaultFaceIndex": 1,
    }


def test_detect_target_faces_returns_structured_error_for_no_face(tmp_path: Path) -> None:
    process_api, config_module, original_service, original_staging_service, original_settings = install_process_test_services(
        tmp_path,
        responses=[[]],
    )

    try:
        response = client.post(
            "/process/target-faces",
            files=[("targetImage", ("target.jpg", create_image_bytes(size=(40, 40)), "image/jpeg"))],
        )
    finally:
        restore_process_test_services(process_api, config_module, original_service, original_staging_service, original_settings)

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "no_target_face",
            "message": "No face detected in the target image.",
        }
    }


def test_process_uses_selected_target_face_index(tmp_path: Path) -> None:
    process_api, config_module, original_service, original_staging_service, original_settings = install_process_test_services(
        tmp_path,
        responses=[
            [
                DetectedFace(bbox=(0, 0, 20, 20), embedding=np.array([1.0, 0.0], dtype=np.float32)),
                DetectedFace(bbox=(10, 10, 14, 14), embedding=np.array([0.0, 1.0], dtype=np.float32)),
            ],
            [DetectedFace(bbox=(2, 3, 8, 9), embedding=np.array([0.0, 1.0], dtype=np.float32))],
        ],
    )

    try:
        response = client.post(
            "/process",
            data={"padding": "0", "threshold": "0.8", "selectedTargetFaceIndex": "1"},
            files=[
                ("targetImage", ("target.jpg", create_image_bytes(size=(40, 40), color=(0, 255, 0)), "image/jpeg")),
                ("candidateImages", ("candidate.jpg", create_image_bytes(size=(30, 20), color=(0, 0, 255)), "image/jpeg")),
            ],
        )
    finally:
        restore_process_test_services(process_api, config_module, original_service, original_staging_service, original_settings)

    assert response.status_code == 200
    payload = response.json()
    assert payload["matchedFaces"] == 1
    assert payload["results"][0]["faceBox"] == {"top": 3, "right": 8, "bottom": 9, "left": 2}
    saved_image = Image.open(Path(payload["results"][0]["savedPath"]))
    assert saved_image.size == (6, 6)


def test_process_returns_structured_error_for_invalid_target_face_index(tmp_path: Path) -> None:
    process_api, config_module, original_service, original_staging_service, original_settings = install_process_test_services(
        tmp_path,
        responses=[[DetectedFace(bbox=(0, 0, 20, 20), embedding=np.array([1.0, 0.0], dtype=np.float32))]],
    )

    try:
        response = client.post(
            "/process",
            data={"padding": "0", "threshold": "0.8", "selectedTargetFaceIndex": "1"},
            files=[
                ("targetImage", ("target.jpg", create_image_bytes(size=(40, 40), color=(0, 255, 0)), "image/jpeg")),
                ("candidateImages", ("candidate.jpg", create_image_bytes(size=(30, 20), color=(0, 0, 255)), "image/jpeg")),
            ],
        )
    finally:
        restore_process_test_services(process_api, config_module, original_service, original_staging_service, original_settings)

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "invalid_target_face_index",
            "message": "Selected target face is out of range.",
        }
    }


def test_process_returns_real_best_match_crop(tmp_path: Path) -> None:
    process_api, config_module, original_service, original_staging_service, original_settings = install_process_test_services(
        tmp_path,
        responses=[
            [
                DetectedFace(bbox=(0, 0, 10, 10), embedding=np.array([1.0, 0.0], dtype=np.float32)),
                DetectedFace(bbox=(0, 0, 20, 20), embedding=np.array([1.0, 0.0], dtype=np.float32)),
            ],
            [
                DetectedFace(bbox=(2, 3, 8, 9), embedding=np.array([0.5, 0.5], dtype=np.float32)),
                DetectedFace(bbox=(5, 4, 15, 14), embedding=np.array([1.0, 0.0], dtype=np.float32)),
            ],
        ],
    )

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
        restore_process_test_services(process_api, config_module, original_service, original_staging_service, original_settings)

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
    process_api, config_module, original_service, original_staging_service, original_settings = install_process_test_services(
        tmp_path,
        responses=[[DetectedFace(bbox=(0, 0, 10, 10), embedding=np.array([1.0, 0.0], dtype=np.float32))]],
    )

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
        restore_process_test_services(process_api, config_module, original_service, original_staging_service, original_settings)

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_candidate_image",
            "message": "Candidate image is not a readable image.",
        }
    }
