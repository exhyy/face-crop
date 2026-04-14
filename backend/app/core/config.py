from functools import lru_cache

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "face-crop-backend"
    app_version: str = "0.1.0"
    insightface_model_name: str = "buffalo_l"
    insightface_detection_size: tuple[int, int] = (640, 640)
    insightface_allowed_providers: tuple[str, ...] = ("CPUExecutionProvider",)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
