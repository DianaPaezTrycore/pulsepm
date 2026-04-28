from app import db as _db
from app.models.activity import Activity


def test_create_project_returns_201(client):
    response = client.post(
        "/api/v1/projects",
        json={"name": "Proyecto Alpha", "description": "Descripción opcional"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "Proyecto Alpha"
    assert data["description"] == "Descripción opcional"
    assert isinstance(data["id"], int)


def test_get_project_returns_evm_indicators(client, sample_activity):
    project = client.post(
        "/api/v1/projects", json={"name": "Proyecto Beta"}
    ).get_json()
    client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={"name": "Act 1", **sample_activity},
    )

    response = client.get(f"/api/v1/projects/{project['id']}")
    assert response.status_code == 200
    data = response.get_json()

    assert len(data["activities"]) == 1
    assert "indicators" in data["activities"][0]
    assert "project_indicators" in data
    assert "cpi_interpretation" in data["project_indicators"]
    assert "spi_interpretation" in data["project_indicators"]
    assert data["project_indicators"]["pv"] == 6000.0
    assert data["project_indicators"]["ev"] == 4000.0


def test_get_nonexistent_project_returns_404(client):
    response = client.get("/api/v1/projects/99999")
    assert response.status_code == 404
    data = response.get_json()
    assert data["error"] == "Project not found"
    assert data["code"] == 404


def test_delete_project_cascades_activities(client, app, sample_activity):
    project = client.post(
        "/api/v1/projects", json={"name": "Proyecto Gamma"}
    ).get_json()
    client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={"name": "Act 1", **sample_activity},
    )

    with app.app_context():
        before = Activity.query.filter_by(project_id=project["id"]).count()
    assert before == 1

    delete_response = client.delete(f"/api/v1/projects/{project['id']}")
    assert delete_response.status_code == 204

    with app.app_context():
        after = Activity.query.filter_by(project_id=project["id"]).count()
    assert after == 0
    _db.session.remove()


def test_list_projects_returns_empty_list(client):
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    assert response.get_json() == []


def test_list_projects_returns_created_projects(client):
    client.post("/api/v1/projects", json={"name": "P1"})
    client.post("/api/v1/projects", json={"name": "P2"})
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2


def test_create_project_returns_422_for_empty_name(client):
    response = client.post("/api/v1/projects", json={"name": ""})
    assert response.status_code == 422
    data = response.get_json()
    assert data["error"] == "Validation error"
    assert "name" in data["details"]


def test_update_project_returns_200(client):
    project = client.post("/api/v1/projects", json={"name": "Original"}).get_json()
    response = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"name": "Updated", "description": "Nueva descripción"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "Updated"
    assert data["description"] == "Nueva descripción"


def test_update_project_returns_404(client):
    response = client.put(
        "/api/v1/projects/99999",
        json={"name": "Updated"},
    )
    assert response.status_code == 404
    data = response.get_json()
    assert data["code"] == 404


def test_update_project_returns_422_for_empty_name(client):
    project = client.post("/api/v1/projects", json={"name": "Original"}).get_json()
    response = client.put(
        f"/api/v1/projects/{project['id']}",
        json={"name": ""},
    )
    assert response.status_code == 422
    data = response.get_json()
    assert "name" in data["details"]


def test_delete_nonexistent_project_returns_404(client):
    response = client.delete("/api/v1/projects/99999")
    assert response.status_code == 404
    data = response.get_json()
    assert data["code"] == 404
