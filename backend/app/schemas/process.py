from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field


class FaceBox(BaseModel):
    top: int
    right: int
    bottom: int
    left: int


class TargetFaceDetectionResponse(BaseModel):
    faces: list[FaceBox]
    defaultFaceIndex: int | None = None


class ProcessResultItem(BaseModel):
    sourceFilename: str
    savedPath: str
    previewUrl: str | None = None
    faceBox: FaceBox | None = None
    matchScore: float | None = None


class ProcessResponse(BaseModel):
    totalImages: int
    detectedFaces: int
    matchedFaces: int
    runId: str
    outputDirectory: str
    results: list[ProcessResultItem]


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail


class ProcessingOptions(BaseModel):
    padding: int = Field(ge=0, le=10000)
    threshold: float = Field(default=0.75, ge=-1.0, le=1.0)
    matchMode: Literal["real"] | None = None
    selectedTargetFaceIndex: int | None = Field(default=None, ge=0)


class ProcessingPaths(BaseModel):
    target_image: Path
    candidate_images: list[Path]
    output_dir: Path
    run_id: str
