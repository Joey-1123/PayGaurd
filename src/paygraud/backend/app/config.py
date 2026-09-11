from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "PayGuard"
    app_version: str = "0.1.0"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://payguard:payguard@localhost:5432/payguard"
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    login_rate_limit: int = 5
    async_analysis: bool = False

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-5-sonnet-20241022"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "https://*.ngrok-free.app",
    ]

    rate_limit_calls: int = 100
    rate_limit_period_seconds: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()