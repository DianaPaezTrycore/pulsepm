from app import db
from app.models.project import Project
from app.services.evm_calculator import (
    calculate_activity_indicators,
    calculate_project_indicators,
)
from app.services.evm_interpreter import interpret_cpi, interpret_spi


def list_projects():
    projects = Project.query.order_by(Project.id).all()
    return [_serialize_project_summary(p) for p in projects]


def get_project_detail(project_id):
    project = db.session.get(Project, project_id)
    if project is None:
        return None
    return _serialize_project_detail(project)


def create_project(data):
    project = Project(name=data["name"], description=data.get("description"))
    db.session.add(project)
    db.session.commit()
    return _serialize_project_summary(project)


def update_project(project_id, data):
    project = db.session.get(Project, project_id)
    if project is None:
        return None
    project.name = data["name"]
    project.description = data.get("description")
    db.session.commit()
    return _serialize_project_summary(project)


def delete_project(project_id):
    project = db.session.get(Project, project_id)
    if project is None:
        return False
    db.session.delete(project)
    db.session.commit()
    return True


def _serialize_project_summary(project):
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
    }


def _activity_to_dict(activity):
    return {
        "bac": float(activity.bac),
        "planned_progress": float(activity.planned_progress),
        "actual_progress": float(activity.actual_progress),
        "actual_cost": float(activity.actual_cost),
    }


def _serialize_activity(activity):
    activity_dict = _activity_to_dict(activity)
    indicators = calculate_activity_indicators(activity_dict)
    indicators["cpi_interpretation"] = interpret_cpi(indicators["cpi"])
    indicators["spi_interpretation"] = interpret_spi(indicators["spi"])
    return {
        "id": activity.id,
        "name": activity.name,
        **activity_dict,
        "indicators": indicators,
    }


def _serialize_project_detail(project):
    activities = [_serialize_activity(a) for a in project.activities]
    activity_dicts = [_activity_to_dict(a) for a in project.activities]
    project_indicators = calculate_project_indicators(activity_dicts)
    project_indicators["cpi_interpretation"] = interpret_cpi(project_indicators["cpi"])
    project_indicators["spi_interpretation"] = interpret_spi(project_indicators["spi"])

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "activities": activities,
        "project_indicators": project_indicators,
    }
