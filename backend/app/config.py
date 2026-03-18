from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

    app_name: str = "Task Tracker API"
    debug: bool = Field(default=False, validation_alias="DEBUG")

    database_url: str = Field(validation_alias="DATABASE_URL")

    jwt_secret_key: str = Field(validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60 * 24, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES")  # 24h

    kafka_bootstrap_servers: str = Field(default="kafka:9092", validation_alias="KAFKA_BOOTSTRAP_SERVERS")


settings = Settings()
