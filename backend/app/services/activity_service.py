from app import db
from app.models.activity import Activity
from app.models.project import Project


def create_activity(project_id, data):
    project = Project.query.get(project_id)
    if project is None:
        return None
    activity = Activity(
        project_id=project_id,
        name=data["name"],
        bac=data["bac"],
        planned_progress=data["planned_progress"],
        actual_progress=data["actual_progress"],
        actual_cost=data["actual_cost"],
    )
    db.session.add(activity)
    db.session.commit()
    return _serialize_activity(activity)


def update_activity(project_id, activity_id, data):
    activity = Activity.query.filter_by(
        id=activity_id, project_id=project_id
    ).first()
    if activity is None:
        return None
    activity.name = data["name"]
    activity.bac = data["bac"]
    activity.planned_progress = data["planned_progress"]
    activity.actual_progress = data["actual_progress"]
    activity.actual_cost = data["actual_cost"]
    db.session.commit()
    return _serialize_activity(activity)


def delete_activity(project_id, activity_id):
    activity = Activity.query.filter_by(
        id=activity_id, project_id=project_id
    ).first()
    if activity is None:
        return False
    db.session.delete(activity)
    db.session.commit()
    return True


def _serialize_activity(activity):
    return {
        "id": activity.id,
        "project_id": activity.project_id,
        "name": activity.name,
        "bac": float(activity.bac),
        "planned_progress": float(activity.planned_progress),
        "actual_progress": float(activity.actual_progress),
        "actual_cost": float(activity.actual_cost),
    }
