from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    environment: str = Field(default="local", alias="ENVIRONMENT")

    database_url: str = Field(alias="DATABASE_URL")

    celery_broker_url: str = Field(alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(alias="CELERY_RESULT_BACKEND")

    minio_endpoint: str = Field(alias="MINIO_ENDPOINT")
    minio_access_key: str = Field(alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(alias="MINIO_SECRET_KEY")
    minio_bucket: str = Field(default="evidence", alias="MINIO_BUCKET")

    openmanus_llm_model: str = Field(default="gpt-4o-mini", alias="OPENMANUS_LLM_MODEL")
    openmanus_base_url: str = Field(default="https://api.openai.com", alias="OPENMANUS_BASE_URL")
    openmanus_api_key: str = Field(default="", alias="OPENMANUS_API_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
