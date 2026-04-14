from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class FaceBox(BaseModel):
    top: int
    right: int
    bottom: int
    left: int


class ProcessResultItem(BaseModel):
    sourceFilename: str
    savedPath: str
    previewUrl: str | None = None
    faceBox: FaceBox | None = None
    matchScore: float | None = None


class ProcessRequest(BaseModel):
    targetImagePath: str = Field(min_length=1)
    candidateImagePaths: list[str] = Field(min_length=1)
    outputDir: str = Field(min_length=1)
    padding: int = Field(ge=0, le=10000)
    threshold: float = Field(default=0.75, ge=-1.0, le=1.0)
    matchMode: Literal["real"] | None = None

    @field_validator("targetImagePath", "outputDir")
    @classmethod
    def validate_non_empty_path(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Path must not be empty")
        return cleaned

    @field_validator("candidateImagePaths")
    @classmethod
    def validate_candidate_paths(cls, value: list[str]) -> list[str]:
        cleaned = [item.strip() for item in value if item.strip()]
        if not cleaned:
            raise ValueError("At least one candidate image path is required")
        return cleaned


class ProcessResponse(BaseModel):
    totalImages: int
    detectedFaces: int
    matchedFaces: int
    results: list[ProcessResultItem]


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail


class ProcessingPaths(BaseModel):
    target_image: Path
    candidate_images: list[Path]
    output_dir: Path
