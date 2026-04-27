import pytest

from app import db as _db


@pytest.fixture(autouse=True)
def clean_database(app):
    """Truncate all tables after each integration test for isolation."""
    yield
    with app.app_context():
        _db.session.rollback()
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()
