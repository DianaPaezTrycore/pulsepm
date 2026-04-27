import pytest

from app import create_app, db as _db
from app.config import TestingConfig


@pytest.fixture(scope="session")
def app():
    application = create_app(TestingConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def sample_activity():
    return {
        "bac": 10000.0,
        "planned_progress": 60.0,
        "actual_progress": 40.0,
        "actual_cost": 7000.0,
    }
