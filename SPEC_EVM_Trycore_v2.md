# SPEC — pulsepm (Trycore Technical Challenge)

## Stack tecnológico

### Backend
| Componente | Tecnología | Versión |
|---|---|---|
| Lenguaje | Python | 3.11+ |
| Framework web | Flask | 3.x |
| ORM | Flask-SQLAlchemy | 3.x |
| Validación | marshmallow | 3.x |
| Base de datos | PostgreSQL | 15 |
| Driver BD | psycopg2-binary | 2.9+ |
| Documentación API | Flasgger | 0.9.7+ |
| CORS | Flask-CORS | 4.x |
| Testing | pytest + pytest-cov | — |
| Linter | flake8 | — |

### Frontend
| Componente | Tecnología | Versión |
|---|---|---|
| Framework UI | React | 18.x |
| Build tool | Vite | 5.x |
| Estilos | Tailwind CSS | 3.x |
| Gráficas | Recharts | 2.x |
| Routing | React Router DOM | 6.x |

### Infraestructura
| Componente | Tecnología |
|---|---|
| Contenedores | Docker + Docker Compose |
| Base de datos | PostgreSQL 15 (imagen oficial) |

---

## Por qué Flask y no FastAPI

Flask es la elección correcta para este proyecto por tres razones concretas:

**1. Control explícito sobre la arquitectura.** Flask no impone estructura. Cada decisión de separación de capas es deliberada y visible. FastAPI genera automáticamente validación y documentación desde type hints, ocultando decisiones de arquitectura que aquí deben ser explícitas.

**2. Separación limpia de la lógica de negocio.** El calculador EVM es lógica pura sin dependencias de framework. Con Flask esa separación es natural. Con FastAPI la tentación de usar `Depends()` y modelos Pydantic en capas internas acopla la lógica al framework.

**3. Testing más directo.** El test client de Flask funciona sobre PostgreSQL de prueba sin configuración adicional. FastAPI requiere `httpx.AsyncClient` con `ASGITransport` y manejo de `async/await`, añadiendo complejidad innecesaria para una API CRUD sincrónica.

---

## Estructura del repositorio

```
pulsepm/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── constants.py
│   │   ├── responses.py            ← helpers compartidos: validation_error, not_found
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── project.py
│   │   │   └── activity.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── project_schema.py
│   │   │   └── activity_schema.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── project_service.py
│   │   │   ├── activity_service.py
│   │   │   ├── evm_calculator.py
│   │   │   └── evm_interpreter.py
│   │   └── controllers/
│   │       ├── __init__.py
│   │       ├── project_controller.py
│   │       └── activity_controller.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── unit/
│   │   │   ├── __init__.py
│   │   │   ├── test_evm_calculator.py
│   │   │   └── test_evm_interpreter.py
│   │   └── integration/
│   │       ├── __init__.py
│   │       ├── conftest.py         ← fixture autouse para aislar tests
│   │       ├── test_projects_api.py
│   │       └── test_activities_api.py
│   ├── migrations/
│   │   └── init.sql
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── .flake8
│   ├── Dockerfile
│   ├── .dockerignore
│   └── run.py
├── frontend/
│   ├── public/
│   │   └── logo.svg                ← logo SVG estilizado (browser/escudo)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityForm.jsx
│   │   │   ├── ActivityTable.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── EVMChart.jsx
│   │   │   ├── ProjectSummary.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── ProjectListPage.jsx
│   │   │   └── ProjectDetailPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .gitignore
├── README.md
└── SPEC_EVM_Trycore_v2.md
```

---

## Backend — `requirements.txt`

```
Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.1
marshmallow==3.21.3
psycopg2-binary==2.9.9
flasgger==0.9.7.1
pytest==7.4.4
pytest-cov==4.1.0
flake8==7.0.0
```

---

## Backend — Base de datos PostgreSQL

### `migrations/init.sql`

```sql
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
```

**NO usar SQLite en ningún contexto. Solo PostgreSQL.**

---

## Backend — `constants.py`

```python
CPI_EFFICIENT_THRESHOLD = 1.0
SPI_ON_SCHEDULE_THRESHOLD = 1.0
PERCENTAGE_MIN = 0.0
PERCENTAGE_MAX = 100.0

CPI_UNDER_BUDGET = "Bajo presupuesto (eficiente en costos)"
CPI_ON_BUDGET = "En presupuesto"
CPI_OVER_BUDGET = "Sobre presupuesto (ineficiente en costos)"
CPI_NO_DATA = "Sin datos suficientes"

SPI_AHEAD = "Adelantado según cronograma"
SPI_ON_SCHEDULE = "En cronograma"
SPI_BEHIND = "Atrasado según cronograma"
SPI_NO_DATA = "Sin datos suficientes"
```

---

## Backend — `config.py`

```python
import os

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL")
```

---

## Backend — `app/__init__.py`

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flasgger import Swagger

db = SQLAlchemy()

def create_app(config_object=None):
    app = Flask(__name__)

    if config_object:
        app.config.from_object(config_object)
    else:
        from app.config import Config
        app.config.from_object(Config)

    db.init_app(app)
    CORS(app)
    Swagger(app, template={
        "info": {"title": "PulsePM API", "version": "1.0.0"},
        "basePath": "/api/v1"
    })

    from app.controllers.project_controller import projects_bp
    from app.controllers.activity_controller import activities_bp
    app.register_blueprint(projects_bp, url_prefix="/api/v1")
    app.register_blueprint(activities_bp, url_prefix="/api/v1")

    return app
```

---

## Backend — Servicio EVM puro (`services/evm_calculator.py`)

**Este archivo NO importa Flask, SQLAlchemy, ni ninguna dependencia externa.**

```python
from app.constants import CPI_EFFICIENT_THRESHOLD, SPI_ON_SCHEDULE_THRESHOLD


def calculate_planned_value(bac: float, planned_progress: float) -> float:
    """PV = (% planificado / 100) × BAC"""
    return (planned_progress / 100) * bac


def calculate_earned_value(bac: float, actual_progress: float) -> float:
    """EV = (% completado / 100) × BAC"""
    return (actual_progress / 100) * bac


def calculate_cost_variance(ev: float, ac: float) -> float:
    """CV = EV - AC"""
    return ev - ac


def calculate_schedule_variance(ev: float, pv: float) -> float:
    """SV = EV - PV"""
    return ev - pv


def calculate_cpi(ev: float, ac: float) -> float | None:
    """CPI = EV / AC. Retorna None si AC == 0"""
    if ac == 0:
        return None
    return ev / ac


def calculate_spi(ev: float, pv: float) -> float | None:
    """SPI = EV / PV. Retorna None si PV == 0"""
    if pv == 0:
        return None
    return ev / pv


def calculate_eac(bac: float, cpi: float | None) -> float | None:
    """EAC = BAC / CPI. Retorna None si CPI es None o 0"""
    if not cpi:
        return None
    return bac / cpi


def calculate_vac(bac: float, eac: float | None) -> float | None:
    """VAC = BAC - EAC. Retorna None si EAC es None"""
    if eac is None:
        return None
    return bac - eac


def calculate_activity_indicators(activity: dict) -> dict:
    bac = float(activity["bac"])
    planned = float(activity["planned_progress"])
    actual = float(activity["actual_progress"])
    ac = float(activity["actual_cost"])

    pv = calculate_planned_value(bac, planned)
    ev = calculate_earned_value(bac, actual)
    cpi = calculate_cpi(ev, ac)

    return {
        "pv": pv,
        "ev": ev,
        "cv": calculate_cost_variance(ev, ac),
        "sv": calculate_schedule_variance(ev, pv),
        "cpi": cpi,
        "spi": calculate_spi(ev, pv),
        "eac": calculate_eac(bac, cpi),
        "vac": calculate_vac(bac, calculate_eac(bac, cpi)),
    }


def calculate_project_indicators(activities: list[dict]) -> dict:
    if not activities:
        return {
            "pv": 0.0, "ev": 0.0, "cv": 0.0, "sv": 0.0,
            "cpi": None, "spi": None, "eac": None, "vac": None
        }

    total_bac = sum(float(a["bac"]) for a in activities)
    total_pv = sum(calculate_planned_value(float(a["bac"]), float(a["planned_progress"])) for a in activities)
    total_ev = sum(calculate_earned_value(float(a["bac"]), float(a["actual_progress"])) for a in activities)
    total_ac = sum(float(a["actual_cost"]) for a in activities)

    cpi = calculate_cpi(total_ev, total_ac)
    eac = calculate_eac(total_bac, cpi)

    return {
        "pv": total_pv,
        "ev": total_ev,
        "cv": calculate_cost_variance(total_ev, total_ac),
        "sv": calculate_schedule_variance(total_ev, total_pv),
        "cpi": cpi,
        "spi": calculate_spi(total_ev, total_pv),
        "eac": eac,
        "vac": calculate_vac(total_bac, eac),
    }
```

---

## Backend — `services/evm_interpreter.py`

```python
from app.constants import (
    CPI_EFFICIENT_THRESHOLD, SPI_ON_SCHEDULE_THRESHOLD,
    CPI_UNDER_BUDGET, CPI_ON_BUDGET, CPI_OVER_BUDGET, CPI_NO_DATA,
    SPI_AHEAD, SPI_ON_SCHEDULE, SPI_BEHIND, SPI_NO_DATA
)


def interpret_cpi(cpi: float | None) -> str:
    if cpi is None:
        return CPI_NO_DATA
    if cpi > CPI_EFFICIENT_THRESHOLD:
        return CPI_UNDER_BUDGET
    if cpi == CPI_EFFICIENT_THRESHOLD:
        return CPI_ON_BUDGET
    return CPI_OVER_BUDGET


def interpret_spi(spi: float | None) -> str:
    if spi is None:
        return SPI_NO_DATA
    if spi > SPI_ON_SCHEDULE_THRESHOLD:
        return SPI_AHEAD
    if spi == SPI_ON_SCHEDULE_THRESHOLD:
        return SPI_ON_SCHEDULE
    return SPI_BEHIND
```

---

## Backend — API REST

### Base URL: `/api/v1`
### Swagger UI: `http://localhost:5000/apidocs`

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/projects` | Lista todos los proyectos |
| POST | `/projects` | Crea un proyecto |
| GET | `/projects/<id>` | Detalle con indicadores EVM consolidados |
| PUT | `/projects/<id>` | Edita nombre y descripción |
| DELETE | `/projects/<id>` | Elimina proyecto y actividades en cascada |

### Actividades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/projects/<id>/activities` | Crea actividad |
| PUT | `/projects/<id>/activities/<act_id>` | Edita actividad |
| DELETE | `/projects/<id>/activities/<act_id>` | Elimina actividad |

### Formato respuesta `GET /projects/<id>`

```json
{
  "id": 1,
  "name": "Proyecto Alpha",
  "description": "Descripción opcional",
  "activities": [
    {
      "id": 1,
      "name": "Actividad 1",
      "bac": 10000,
      "planned_progress": 60,
      "actual_progress": 40,
      "actual_cost": 7000,
      "indicators": {
        "pv": 6000, "ev": 4000, "cv": -3000, "sv": -2000,
        "cpi": 0.571, "spi": 0.667, "eac": 17513.0, "vac": -7513.0
      }
    }
  ],
  "project_indicators": {
    "pv": 6000, "ev": 4000, "cv": -3000, "sv": -2000,
    "cpi": 0.571, "spi": 0.667, "eac": 17513.0, "vac": -7513.0,
    "cpi_interpretation": "Sobre presupuesto (ineficiente en costos)",
    "spi_interpretation": "Atrasado según cronograma"
  }
}
```

### Errores estándar

```json
{ "error": "Project not found", "code": 404 }
{ "error": "Validation error", "details": { "bac": "Must be greater than 0" }, "code": 422 }
{ "error": "Internal server error", "code": 500 }
```

Cada endpoint debe documentarse con docstring Flasgger incluyendo: tags, parámetros, schemas de request/response, y códigos 200/201/404/422/500 según aplique.

---

## Backend — `.flake8`

```ini
[flake8]
max-line-length = 100
exclude = .git,__pycache__,migrations
```

---

## Tests

### `tests/conftest.py`

```python
import pytest
from app import create_app, db as _db
from app.config import TestingConfig


@pytest.fixture(scope="session")
def app():
    application = create_app(TestingConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def sample_activity():
    return {
        "bac": 10000.0,
        "planned_progress": 60.0,
        "actual_progress": 40.0,
        "actual_cost": 7000.0,
    }
```

### `tests/unit/test_evm_calculator.py` — casos obligatorios

```python
# Happy path
def test_pv_normal_case()              # PV = 6000 dado BAC=10000, plan=60%
def test_ev_normal_case()              # EV = 4000 dado BAC=10000, real=40%
def test_cv_positive_when_under_budget()
def test_cv_negative_when_over_budget()
def test_cpi_greater_than_one_when_efficient()
def test_spi_less_than_one_when_delayed()
def test_eac_calculation()
def test_vac_calculation()

# Edge cases
def test_cpi_returns_none_when_ac_is_zero()
def test_spi_returns_none_when_pv_is_zero()
def test_eac_returns_none_when_cpi_is_none()
def test_project_indicators_with_empty_activities_list()
def test_project_indicators_with_zero_actual_progress()
def test_activity_indicators_full_calculation()
def test_project_consolidated_with_multiple_activities()
```

### `tests/integration/` — un test por endpoint mínimo

```python
# Projects API
def test_list_projects_returns_empty_list()
def test_list_projects_returns_created_projects()
def test_create_project_returns_201()
def test_create_project_returns_422_for_empty_name()
def test_get_project_returns_evm_indicators()
def test_get_nonexistent_project_returns_404()
def test_update_project_returns_200()
def test_update_project_returns_404()
def test_update_project_returns_422_for_empty_name()
def test_delete_project_cascades_activities()
def test_delete_nonexistent_project_returns_404()

# Activities API
def test_create_activity_with_negative_bac_returns_422()
def test_create_activity_for_nonexistent_project_returns_404()
def test_update_activity_returns_200()
def test_update_activity_returns_404_for_wrong_project()
def test_update_activity_returns_422_for_invalid_data()
def test_update_activity_recalculates_indicators()
def test_delete_activity_returns_204()
def test_delete_activity_returns_404()
```

### Cobertura mínima: 85% sobre todo `app/`

Configuración en `backend/pytest.ini`:

```ini
[pytest]
testpaths = tests
addopts =
    --cov=app
    --cov-report=term-missing
    --cov-fail-under=85
```

Comando manual equivalente:

```bash
pytest --cov=app --cov-report=term-missing --cov-fail-under=85
```

---

## Frontend

### Identidad visual
- **Logo:** SVG estilizado en la barra de navegación superior (archivo `public/logo.svg`)
- **Nombre de la app:** PulsePM
- **Sin ningún contenido, logo, texto ni referencia a Angular**
- Paleta: utilities Tailwind cargadas vía CDN (`cdn.tailwindcss.com`), familia `slate`, `blue`, `emerald`, `red`, `amber`
- Tipografía: **Inter** (Google Fonts)

### Páginas y navegación

**`ProjectListPage`** — ruta `/`
- Header oscuro con logo + nombre "PulsePM" + nav "Proyectos"
- Lista de proyectos como cards con ícono de carpeta
- Botón "Nuevo proyecto" → abre modal con formulario
- Cada card tiene botón "Ver detalle" y botón "Eliminar" → `ConfirmModal` estilizado
- Estado vacío con mensaje cuando no hay proyectos

**`ProjectDetailPage`** — ruta `/projects/:id`
- Header oscuro con logo + nombre "PulsePM"
- **Botón "← Volver a proyectos"** visible en la parte superior, que navega a `/`
- Nombre del proyecto editable inline
- `ActivityTable` como **lista de cards** con barra de estado coloreada, filtros por tab (Todas / Pendientes / En progreso / Completadas / En riesgo) y chevron expand/collapse con métricas EVM detalladas
- `ProjectSummary` con tarjetas de CPI y SPI + `StatusBadge` de color
- `EVMChart` — gráfico de barras agrupado por actividad (PV, EV, AC) con leyenda inline en el header
- `EVMGlossary` — sección colapsable con definiciones de los 10 indicadores EVM
- Botón "Agregar actividad" → form inline tipo card al inicio de la lista
- Cada actividad tiene botón editar y botón eliminar (eliminar abre `ConfirmModal`)

### `StatusBadge`
Píldora con dot indicador de color a la izquierda del texto:

```
CPI/SPI > 1   → badge verde (emerald)   "Eficiente" / "Adelantado"
CPI/SPI == 1  → badge azul              "En objetivo"
CPI/SPI < 1   → badge rojo              "Ineficiente" / "Atrasado"
null          → badge gris (slate)      "Sin datos"
```

### `EVMChart`
- Recharts `BarChart` agrupado dentro de card con header propio
- Series: PV (azul `#3B82F6`), EV (verde `#10B981`), AC (ámbar `#F59E0B`)
- Eje X: nombre de actividad truncado a 12 caracteres si es largo
- Eje Y: formato numérico con separador de miles (`Intl.NumberFormat('es-CO')`)
- Tooltip personalizado y leyenda inline en el header
- Empty state cuando no hay actividades (no se renderiza el chart)

### `ConfirmModal`
- Modal de confirmación reutilizable para acciones destructivas
- Mismo lenguaje visual que `NewProjectModal`: backdrop con blur, card centrada, botones cancelar/confirmar
- Usado para eliminar proyectos y eliminar actividades

### `api.js`
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Manejar errores HTTP — lanzar excepción si response.ok === false
// Manejar estado loading y error en cada página
```

### `package.json` — dependencias
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "vite": "^5.4.2",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.10",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.45"
  }
}
```

---

## Docker Compose

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: pulsepm
      POSTGRES_USER: pulsepm_user
      POSTGRES_PASSWORD: pulsepm_pass
    ports:
      - "5432:5432"
    volumes:
      - ./backend/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://pulsepm_user:pulsepm_pass@db:5432/pulsepm
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000/api/v1

volumes:
  postgres_data:
```

---

## Gitflow — INSTRUCCIONES ESTRICTAS

### Responsabilidades divididas

**Claude Code hace:**
- Crear ramas, desarrollar, commitear, hacer push

**Tú haces manualmente en GitHub:**
- Abrir el Pull Request de `feature/*` → `develop`
- Aprobar y hacer merge del PR
- Abrir el PR de `release/1.0.0` → `main`
- Crear el tag `1.0.0` tras el merge a main
- Abrir el PR de `release/1.0.0` → `develop`

**Nunca:** commit directo a `main` ni a `develop`. Todo pasa por PR.

---

### Paso 0 — Configuración inicial (una sola vez)

```bash
# Claude Code ejecuta:
git init
git checkout -b main
echo "# PulsePM" > README.md
git add README.md
git commit -m "chore(repo): Inicializar repositorio"
git remote add origin https://github.com/<tu-usuario>/pulsepm.git
git push -u origin main

git checkout -b develop
git push -u origin develop
```

---

### Flujo por cada feature — Claude Code

```bash
# 1. Partir desde develop actualizado
git checkout develop
git pull origin develop

# 2. Crear rama
git checkout -b feature/<nombre>

# 3. Desarrollar con commits descriptivos
git add .
git commit -m "feat(<scope>): Descripción en español"

# 4. Push y detenerse — NO mergear
git push origin feature/<nombre>

# ⛔ STOP: Claude Code se detiene aquí y avisa:
# "Rama feature/<nombre> lista. Abre el PR en GitHub:
#  feature/<nombre> → develop, luego confirma para continuar."
```

**Tú en GitHub:**
1. Ir a `https://github.com/<tu-usuario>/pulsepm`
2. Clic en "Compare & pull request"
3. Base: `develop` ← Compare: `feature/<nombre>`
4. Título del PR: mismo mensaje del commit principal
5. Merge con "Create a merge commit" (no squash)
6. Eliminar la rama tras el merge

```bash
# Después del merge en GitHub, Claude Code continúa:
git checkout develop
git pull origin develop
# → listo para la siguiente feature
```

---

### Features en orden
```
1.  feature/configuracion-proyecto
2.  feature/modelos-base-de-datos
3.  feature/servicio-calculadora-evm
4.  feature/servicio-interprete-evm
5.  feature/api-proyectos
6.  feature/api-actividades
7.  feature/swagger-documentacion
8.  feature/pruebas-unitarias
9.  feature/pruebas-integracion
10. feature/frontend-configuracion
11. feature/pagina-lista-proyectos
12. feature/pagina-detalle-proyecto
13. feature/grafico-evm
14. feature/docker-compose
```

---

### Release final

**Claude Code:**
```bash
git checkout develop
git pull origin develop
git checkout -b release/1.0.0
# Ajustes finales de versión si aplica
git commit -m "chore(release): Preparar versión 1.0.0"
git push origin release/1.0.0
```

**Tú en GitHub:**
1. PR: `release/1.0.0` → `main` — título: "Publicar versión 1.0.0"
2. Merge con merge commit
3. En la pestaña Releases → "Create a new release" → tag `1.0.0` sobre `main`
4. Segundo PR: `release/1.0.0` → `develop` — título: "Integrar release/1.0.0 en develop"
5. Merge

**Claude Code al final:**
```bash
git checkout develop
git pull origin develop
```

### Convención de commits — INGLÉS IMPERATIVO

Formato: `Descripción imperativa corta en inglés`. Sin prefijo de tipo obligatorio.
Mensajes vagos como `fix`, `wip`, `update`, `cambios` **no son aceptables**.

### Ejemplos de commits válidos para este proyecto
```
Initialize repository with README and project specification
Add Project SQLAlchemy model
Add Activity SQLAlchemy model with relation to Project
Add PV, EV, CV and SV calculation functions
Add CPI and SPI calculation with zero-division handling
Add EAC, VAC and consolidated project indicators
Fix CPI edge case when AC is zero
Add textual interpretation of CPI and SPI
Add GET /projects endpoint with project listing
Add POST /projects endpoint with validation schema
Add GET /projects/<id> endpoint with EVM indicators
Add PUT and DELETE /projects/<id> endpoints
Add POST /projects/<id>/activities endpoint with ActivitySchema
Add PUT and DELETE /projects/<id>/activities/<act_id> endpoints
Document all endpoints with Flasgger
Add unit tests for EVM calculator happy path
Add edge case tests for EVM calculator AC zero and empty list
Add unit tests for EVM interpreter
Add integration tests for projects API with database isolation
Add integration tests for activities API
Initialize React frontend with Vite Tailwind and Router
Add project list page with cards loading and empty state
Add new project modal with form
Add delete button with confirmation
Add ProjectDetailPage shell with back button and inline name editing
Add StatusBadge and ProjectSummary indicator cards
Add ActivityTable with read-only rows and totals
Add ActivityForm with add edit and delete activity actions
Add EVMChart with grouped bars for PV EV AC by activity
Add Docker Compose with PostgreSQL backend and frontend services
Replace deprecated Project.query.get with Session.get
Abstract validation and not found error responses with helpers
Remove deprecated version key from docker-compose
```

### Commits INVÁLIDOS — nunca usar
```
fix
cambios
wip
update
arreglos
varios cambios
```

---

## Reglas de clean code — sin excepciones

- Sin `print()` de debug en ningún archivo
- Sin bloques de código comentado
- Sin variables sin usar
- Sin strings literales en servicios (todo en `constants.py`)
- Sin lógica de negocio en controllers
- `evm_calculator.py` sin imports de Flask ni SQLAlchemy
- Funciones con una sola responsabilidad
- Flake8 debe pasar sin errores: `flake8 app/`
- Frontend: manejar estados `loading` y `error` en cada llamada API
- Frontend: sin referencias, logos, textos ni imports relacionados con Angular

---

## README.md — secciones requeridas

```markdown
# PulsePM — Gestión de proyectos con Valor Ganado (EVM)

## Requisitos previos
## Levantar con Docker Compose
## Levantar manualmente (backend y frontend)
## Correr tests
## Ver documentación Swagger
## Qué es EVM (explicación breve)
```
