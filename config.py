from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ── App ────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # ── Database ───────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/aiclonechat"

    # ── Redis ──────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT ────────────────────────────────────────────────────────────────
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24        # 1 day
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    # ── AI ─────────────────────────────────────────────────────────────────
    AI_MODEL_NAME: str = "mistralai/Mistral-7B-Instruct-v0.2"
    AI_API_KEY: str = ""                  # HuggingFace Inference API key
    AI_API_URL: str = "https://api-inference.huggingface.co/models"
    AI_MAX_NEW_TOKENS: int = 256
    AI_TEMPERATURE: float = 0.8
    AI_TIMEOUT_SECONDS: int = 30

    # ── Clone behaviour ────────────────────────────────────────────────────
    CLONE_OFFLINE_DELAY_SECONDS: int = 10   # wait before clone auto-replies
    CLONE_MAX_TRAINING_TURNS: int = 200     # turns stored per clone


settings = Settings()
