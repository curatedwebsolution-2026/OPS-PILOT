import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "OPS PILOT"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "ops-pilot-super-secret-key-32bytes-minimum-length-for-hs256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Database URLs
    # Default to sqlite for local dev without postgres setup, can override via ENV
    DATABASE_URL: str = "sqlite+aiosqlite:///./opspilot.db"
    DATABASE_URL_SYNC: str = "sqlite:///./opspilot.db"

    REDIS_URL: str = "redis://localhost:6379/0"

    # LLM Providers
    DEFAULT_LLM_PROVIDER: str = "mock"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
