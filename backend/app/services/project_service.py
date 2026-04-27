from app.models.project import Project


def list_projects():
    projects = Project.query.order_by(Project.id).all()
    return [_serialize_project_summary(p) for p in projects]


def _serialize_project_summary(project):
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
    }
