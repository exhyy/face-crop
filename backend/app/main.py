import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.process import router as process_router
from app.core.config import get_settings
from app.schemas.process import ErrorResponse
from app.services.errors import AppError
from app.utils.logging import configure_logging

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(title=settings.app_name, version=settings.app_version)
app.include_router(health_router)
app.include_router(process_router)


@app.exception_handler(AppError)
async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error={"code": exc.code, "message": exc.message}).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    message = exc.errors()[0].get("msg", "Invalid request payload") if exc.errors() else "Invalid request payload"
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(error={"code": "invalid_request", "message": message}).model_dump(),
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("unexpected error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error={"code": "internal_error", "message": "An unexpected error occurred."}
        ).model_dump(),
    )
