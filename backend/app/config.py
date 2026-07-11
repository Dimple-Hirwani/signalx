from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    secret_key: str = "dev-secret-key-change-in-production"
    access_token_expire_minutes: int = 1440  # 24 hours
    database_url: str = "sqlite+aiosqlite:///./signalx.db"
    upload_dir: str = "./uploads"
    max_upload_size_bytes: int = 26_214_400  # 25 MB
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
