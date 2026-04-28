def test_create_activity_with_negative_bac_returns_422(client):
    project = client.post(
        "/api/v1/projects", json={"name": "Proyecto Delta"}
    ).get_json()

    response = client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={
            "name": "Bad activity",
            "bac": -100,
            "planned_progress": 50,
            "actual_progress": 25,
            "actual_cost": 100,
        },
    )
    assert response.status_code == 422
    data = response.get_json()
    assert data["error"] == "Validation error"
    assert "bac" in data["details"]


def test_update_activity_recalculates_indicators(client, sample_activity):
    project = client.post(
        "/api/v1/projects", json={"name": "Proyecto Epsilon"}
    ).get_json()
    activity = client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={"name": "Act 1", **sample_activity},
    ).get_json()

    before = client.get(f"/api/v1/projects/{project['id']}").get_json()
    cpi_before = before["project_indicators"]["cpi"]

    client.put(
        f"/api/v1/projects/{project['id']}/activities/{activity['id']}",
        json={
            "name": "Act 1",
            "bac": 10000,
            "planned_progress": 60,
            "actual_progress": 80,
            "actual_cost": 4000,
        },
    )

    after = client.get(f"/api/v1/projects/{project['id']}").get_json()
    cpi_after = after["project_indicators"]["cpi"]

    assert cpi_after != cpi_before
    assert cpi_after > 1.0


def test_create_activity_for_nonexistent_project_returns_404(client):
    response = client.post(
        "/api/v1/projects/99999/activities",
        json={
            "name": "Act",
            "bac": 1000,
            "planned_progress": 50,
            "actual_progress": 25,
            "actual_cost": 300,
        },
    )
    assert response.status_code == 404
    data = response.get_json()
    assert data["code"] == 404


def test_update_activity_returns_200(client, sample_activity):
    project = client.post("/api/v1/projects", json={"name": "Proyecto Zeta"}).get_json()
    activity = client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={"name": "Act 1", **sample_activity},
    ).get_json()

    response = client.put(
        f"/api/v1/projects/{project['id']}/activities/{activity['id']}",
        json={
            "name": "Act Actualizada",
            "bac": 10000,
            "planned_progress": 60,
            "actual_progress": 50,
            "actual_cost": 6000,
        },
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "Act Actualizada"
    assert data["actual_progress"] == 50.0


def test_update_activity_returns_404_for_wrong_project(client, sample_activity):
    project = client.post("/api/v1/projects", json={"name": "Proyecto Eta"}).get_json()
    activity = client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={"name": "Act 1", **sample_activity},
    ).get_json()

    response = client.put(
        f"/api/v1/projects/99999/activities/{activity['id']}",
        json={
            "name": "Act 1",
            "bac": 10000,
            "planned_progress": 60,
            "actual_progress": 40,
            "actual_cost": 7000,
        },
    )
    assert response.status_code == 404
    data = response.get_json()
    assert data["code"] == 404


def test_update_activity_returns_422_for_invalid_data(client, sample_activity):
    project = client.post("/api/v1/projects", json={"name": "Proyecto Theta"}).get_json()
    activity = client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={"name": "Act 1", **sample_activity},
    ).get_json()

    response = client.put(
        f"/api/v1/projects/{project['id']}/activities/{activity['id']}",
        json={
            "name": "Act 1",
            "bac": -500,
            "planned_progress": 60,
            "actual_progress": 40,
            "actual_cost": 7000,
        },
    )
    assert response.status_code == 422
    data = response.get_json()
    assert "bac" in data["details"]


def test_delete_activity_returns_204(client, sample_activity):
    project = client.post("/api/v1/projects", json={"name": "Proyecto Iota"}).get_json()
    activity = client.post(
        f"/api/v1/projects/{project['id']}/activities",
        json={"name": "Act 1", **sample_activity},
    ).get_json()

    response = client.delete(
        f"/api/v1/projects/{project['id']}/activities/{activity['id']}"
    )
    assert response.status_code == 204


def test_delete_activity_returns_404(client):
    project = client.post("/api/v1/projects", json={"name": "Proyecto Kappa"}).get_json()
    response = client.delete(
        f"/api/v1/projects/{project['id']}/activities/99999"
    )
    assert response.status_code == 404
    data = response.get_json()
    assert data["code"] == 404
