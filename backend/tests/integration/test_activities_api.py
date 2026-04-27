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
