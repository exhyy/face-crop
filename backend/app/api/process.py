import logging

from fastapi import APIRouter

from app.schemas.process import ErrorResponse, ProcessRequest, ProcessResponse
from app.services.face_matching import ProcessService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["process"])
service = ProcessService()


@router.post(
    "/process",
    response_model=ProcessResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def process_images(request: ProcessRequest) -> ProcessResponse:
    logger.info("received process request", extra={"total_images": len(request.candidateImagePaths)})
    return service.process(request)
