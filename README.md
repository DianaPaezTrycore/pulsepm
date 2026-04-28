# PulsePM — Gestión de proyectos con Valor Ganado (EVM)

Aplicación web de gestión de proyectos que calcula y visualiza los indicadores
de **Earned Value Management (EVM)** por actividad y consolidados por proyecto.

- **Backend**: Flask 3 + SQLAlchemy + marshmallow + PostgreSQL 15 + Flasgger.
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts + React Router.
- **Infraestructura**: Docker Compose (3 servicios: db, backend, frontend).

Para la especificación completa ver [`SPEC_EVM_Trycore_v2.md`](SPEC_EVM_Trycore_v2.md).

---

## Requisitos previos

Para levantar con Docker Compose (recomendado):
- **Docker** 24+ con plugin Compose v2

Para levantar manualmente:
- **Python** 3.11+
- **Node.js** 20+
- **PostgreSQL** 15
- **npm** 10+

---

## Levantar con Docker Compose

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Esto construye las imágenes y arranca los 3 servicios:

| Servicio | URL local | Descripción |
|---|---|---|
| Frontend (Vite) | http://localhost:3000 | UI React |
| Backend (Flask) | http://localhost:5000 | API REST |
| Swagger UI | http://localhost:5000/apidocs | Documentación interactiva |
| PostgreSQL | localhost:5432 | Base de datos (credenciales en `docker-compose.yml`) |

Para detener: `Ctrl+C` o `docker compose down` (agregar `-v` para borrar el volumen
de Postgres).

> **Nota:** si el puerto 5432 ya está ocupado en tu máquina (por otro Postgres),
> crea un `docker-compose.override.yml` mapeando el puerto a otro libre, por ejemplo:
> ```yaml
> services:
>   db:
>     ports: !override
>       - "5433:5432"
> ```
> Está en `.gitignore`, no se commitea.

---

## Levantar manualmente (backend y frontend)

### Backend

```bash
# 1. Crear y activar entorno virtual
cd backend
python -m venv venv
source venv/bin/activate           # Linux/Mac
# venv\Scripts\activate            # Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Crear la base de datos PostgreSQL local
createdb pulsepm                   # asume usuario y permisos configurados

# 4. Ejecutar el script de inicialización del esquema
psql pulsepm -f migrations/init.sql

# 5. Configurar variables de entorno y arrancar
export DATABASE_URL=postgresql://USER:PASS@localhost:5432/pulsepm
python run.py
```

El backend queda en `http://localhost:5000`.

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:3000` y consume el backend en
`http://localhost:5000/api/v1` por default.

Para apuntar a un backend distinto, define `VITE_API_URL`:

```bash
VITE_API_URL=http://otro-host:5000/api/v1 npm run dev
```

---

## Correr tests

Los tests unitarios no requieren BD. Los tests de integración sí.

### Con Docker Compose ya arriba

Crear la base de datos de tests una sola vez:

```bash
docker compose exec db createdb -U pulsepm_user pulsepm_test
```

Correr tests con cobertura:

```bash
docker compose exec \
  -e TEST_DATABASE_URL=postgresql://pulsepm_user:pulsepm_pass@db:5432/pulsepm_test \
  backend pytest --cov=app --cov-report=term-missing
```

### Localmente sin Docker

```bash
cd backend
source venv/bin/activate
export TEST_DATABASE_URL=postgresql://USER:PASS@localhost:5432/pulsepm_test
pytest --cov=app --cov-report=term-missing
```

**Cobertura mínima exigida: 85%** (configurada en `backend/pytest.ini` con
`--cov-fail-under=85`).

Resultado actual: 42 tests, 99% cobertura, 100% sobre `app/services/`.

---

## Ver documentación Swagger

Una vez arriba el backend, abrir:

**http://localhost:5000/apidocs**

Muestra los 8 endpoints REST agrupados por tag (`Projects`, `Activities`), con
schemas reutilizables (`Project`, `Activity`, `Indicators`, `ProjectDetail`,
`Error`, `ValidationError`, etc.) y los códigos de respuesta posibles
(200, 201, 204, 404, 422, 500).

Cada endpoint incluye:
- Descripción de qué hace
- Parámetros de path y body (request schema)
- Ejemplo de respuesta (response schema)
- Códigos de error con su formato

---

## Qué es EVM (explicación breve)

**Earned Value Management** (Valor Ganado) es una metodología del PMBOK que combina
alcance, cronograma y costo para medir objetivamente el desempeño de un proyecto.

Las **8 métricas EVM** que calcula PulsePM:

| Sigla | Nombre | Fórmula | Qué mide |
|---|---|---|---|
| **BAC** | Budget at Completion | (campo) | Presupuesto total planificado |
| **PV** | Planned Value | `% planificado × BAC` | Valor del trabajo que debí haber hecho |
| **EV** | Earned Value | `% completado × BAC` | Valor del trabajo que realmente hice |
| **AC** | Actual Cost | (campo) | Lo que efectivamente he gastado |
| **CV** | Cost Variance | `EV − AC` | Desviación de costo (positivo = bajo presupuesto) |
| **SV** | Schedule Variance | `EV − PV` | Desviación de cronograma (positivo = adelantado) |
| **CPI** | Cost Performance Index | `EV / AC` | Eficiencia en costo (>1 = eficiente) |
| **SPI** | Schedule Performance Index | `EV / PV` | Eficiencia en cronograma (>1 = adelantado) |
| **EAC** | Estimate at Completion | `BAC / CPI` | Costo total estimado al ritmo actual |
| **VAC** | Variance at Completion | `BAC − EAC` | Desviación final esperada |

PulsePM calcula estos indicadores **por actividad** y **consolidados por proyecto**
(sumando BAC, PV, EV y AC de todas las actividades antes de aplicar las fórmulas).
Además, los valores de CPI y SPI se acompañan de una **interpretación textual**
(p. ej. "Sobre presupuesto", "En cronograma", "Atrasado") generada por el servicio
`evm_interpreter`.

---

## Estructura del proyecto

```
pulsepm/
├── backend/         Flask app, modelos, servicios, controllers, tests
├── frontend/        React app (Vite, Tailwind via CDN, Recharts)
├── docker-compose.yml
├── README.md        (este archivo)
└── SPEC_EVM_Trycore_v2.md   Especificación funcional y técnica
```

---

## Gitflow

- `main`: producción, tag `1.0.0`
- `develop`: rama de integración
- `feature/*`: una por funcionalidad, mergeada vía PR
- `release/1.0.0`: rama de release antes del merge final a `main`

Mensajes de commit en **inglés imperativo** (`Add ...`, `Fix ...`, `Replace ...`).
