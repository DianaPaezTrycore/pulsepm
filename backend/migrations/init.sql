CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
    id               SERIAL PRIMARY KEY,
    project_id       INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    bac              NUMERIC(15, 2) NOT NULL,
    planned_progress NUMERIC(5, 2) NOT NULL,
    actual_progress  NUMERIC(5, 2) NOT NULL,
    actual_cost      NUMERIC(15, 2) NOT NULL,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);
