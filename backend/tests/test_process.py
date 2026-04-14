from pathlib import Path
from typing import cast

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def create_image(path: Path, color: tuple[int, int, int] = (255, 0, 0)) -> None:
    image = Image.new("RGB", (24, 24), color=cast(int | tuple[int, int, int], color))
    image.save(path)


def test_process_returns_placeholder_matches(tmp_path: Path) -> None:
    target = tmp_path / "target.jpg"
    candidate = tmp_path / "candidate.jpg"
    output_dir = tmp_path / "output"
    output_dir.mkdir()

    create_image(target)
    create_image(candidate, color=(0, 0, 255))

    response = client.post(
        "/process",
        json={
            "targetImagePath": str(target),
            "candidateImagePaths": [str(candidate)],
            "outputDir": str(output_dir),
            "padding": 4,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["totalImages"] == 1
    assert payload["detectedFaces"] == 1
    assert payload["matchedFaces"] == 1
    assert payload["results"][0]["sourceFilename"] == "candidate.jpg"
    saved_path = Path(payload["results"][0]["savedPath"])
    assert saved_path.exists()
    assert saved_path.parent == output_dir


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
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "missing_target_image",
            "message": "Target image does not exist.",
        }
    }


def test_process_returns_structured_error_for_unreadable_candidate(tmp_path: Path) -> None:
    target = tmp_path / "target.jpg"
    candidate = tmp_path / "candidate.jpg"
    output_dir = tmp_path / "output"
    output_dir.mkdir()
    create_image(target)
    candidate.write_text("not an image", encoding="utf-8")

    response = client.post(
        "/process",
        json={
            "targetImagePath": str(target),
            "candidateImagePaths": [str(candidate)],
            "outputDir": str(output_dir),
            "padding": 2,
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_candidate_image",
            "message": "Candidate image is not a readable image.",
        }
    }
