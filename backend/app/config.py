import os

from sqlalchemy.pool import NullPool


class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql://pulsepm_user:pulsepm_pass@localhost:5433/pulsepm",
    )
    SQLALCHEMY_ENGINE_OPTIONS = {"poolclass": NullPool}
