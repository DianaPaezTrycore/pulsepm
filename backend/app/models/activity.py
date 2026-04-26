from app import db


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer,
        db.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = db.Column(db.String(255), nullable=False)
    bac = db.Column(db.Numeric(15, 2), nullable=False)
    planned_progress = db.Column(db.Numeric(5, 2), nullable=False)
    actual_progress = db.Column(db.Numeric(5, 2), nullable=False)
    actual_cost = db.Column(db.Numeric(15, 2), nullable=False)
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False,
    )

    project = db.relationship("Project", back_populates="activities")
