import logging
from typing import Annotated, Literal

from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.process import ErrorResponse, ProcessResponse, ProcessingOptions, TargetFaceDetectionResponse
from app.services.face_matching import ProcessService
from app.services.upload_staging import UploadStagingService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["process"])
service = ProcessService()
staging_service = UploadStagingService()


@router.post(
    "/process/target-faces",
    response_model=TargetFaceDetectionResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def detect_target_faces(
    targetImage: Annotated[UploadFile | None, File()] = None,
) -> TargetFaceDetectionResponse:
    logger.info("received target face detection request")
    paths = staging_service.stage_uploads(target_image=targetImage, candidate_images=[], require_candidates=False)

    try:
        return service.detect_target_faces(paths.target_image)
    finally:
        staging_service.cleanup_inputs(paths)


@router.post(
    "/process",
    response_model=ProcessResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def process_images(
    candidateImages: Annotated[list[UploadFile], File()],
    targetImage: Annotated[UploadFile | None, File()] = None,
    padding: Annotated[int, Form()] = 0,
    threshold: Annotated[float, Form()] = 0.75,
    matchMode: Annotated[Literal["real"] | None, Form()] = None,
    selectedTargetFaceIndex: Annotated[int | None, Form()] = None,
) -> ProcessResponse:
    options = ProcessingOptions(
        padding=padding,
        threshold=threshold,
        matchMode=matchMode,
        selectedTargetFaceIndex=selectedTargetFaceIndex,
    )
    logger.info("received process request", extra={"total_images": len(candidateImages)})
    paths = staging_service.stage_uploads(target_image=targetImage, candidate_images=candidateImages)

    try:
        return service.process_paths(paths, options)
    finally:
        staging_service.cleanup_inputs(paths)
