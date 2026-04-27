from app import db
from app.models.project import Project


def list_projects():
    projects = Project.query.order_by(Project.id).all()
    return [_serialize_project_summary(p) for p in projects]


def create_project(data):
    project = Project(name=data["name"], description=data.get("description"))
    db.session.add(project)
    db.session.commit()
    return _serialize_project_summary(project)


def _serialize_project_summary(project):
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
    }
