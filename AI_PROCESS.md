# AI_PROCESS — Uso de IA en el desarrollo de PulsePM

Este documento describe cómo se utilizó asistencia de IA (Claude Code) para construir
PulsePM, qué decisiones se tomaron, qué se delegó y qué se mantuvo en control humano.

---

## Herramienta utilizada

**Claude Code** (CLI de Anthropic) — sesiones interactivas en VS Code/terminal con
acceso a edición de archivos, ejecución de Bash, control de Git y verificación con
Docker. Modelo: `claude-opus-4-7`.

---

## División de responsabilidades

### Lo que hizo la IA
- Generación de código (Flask, SQLAlchemy, marshmallow, React, JSX, Tailwind, Recharts).
- Estructuración por capas (`models / schemas / services / controllers`).
- Implementación de las 8 fórmulas EVM (PV, EV, CV, SV, CPI, SPI, EAC, VAC).
- Documentación Swagger/OpenAPI con `definitions` reutilizables.
- Tests unitarios e integración (29 → 42 a lo largo de iteraciones).
- Setup de Docker Compose y orquestación de los 3 servicios.
- Refactors de calidad: `Session.get` SQLAlchemy 2.0, helpers de respuestas HTTP
  (`validation_error_response`, `not_found_response`).
- Auditorías de cumplimiento contra el SPEC y de code smells.
- Commits y push siguiendo gitflow estricto.

### Lo que hizo el humano
- Definición del SPEC (`SPEC_EVM_Trycore_v2.md`) y aprobación de cada feature.
- Apertura, revisión y merge de **todos** los Pull Requests en GitHub.
- Decisiones de diseño visual (paleta azul, tipografía Inter, layout tipo Jira/Monday).
- Rediseño manual de componentes UI (cards en lugar de tabla, modal de confirmación,
  glosario EVM, panel expandible por actividad).
- Aprobación o rechazo de planes propuestos por la IA antes de cada feature.
- Verificación visual de la app en el navegador después de cambios de UI.
- Decisión de mantener Tailwind vía CDN tras detectar problemas con PostCSS en Docker.

---

## Flujo de trabajo

Cada feature siguió el patrón:

1. **Propuesta**: la IA presentaba un plan de scope, archivos afectados, decisiones
   técnicas y commits propuestos.
2. **Aprobación**: el humano confirmaba o pedía ajustes.
3. **Ejecución**: la IA creaba la rama, hacía commits atómicos y push.
4. **PR manual**: el humano abría el PR, lo revisaba y mergeaba.
5. **Sync**: la IA hacía `git pull` de develop antes de la siguiente feature.

Para cambios sensibles (UI, scope grande), el humano pidió **verificación commit a
commit** antes de avanzar.

---

## Decisiones notables

| Decisión | Quién | Razón |
|---|---|---|
| Convención de commits en inglés imperativo | Humano | El SPEC original mostraba español pero el rubric de evaluación pide inglés |
| Tailwind vía CDN en lugar de build local con PostCSS | Humano | PostCSS no procesaba CSS dentro del contenedor Docker; CDN funcionó al primer intento |
| `db.session.get(Project, id)` en vez de `Project.query.get(id)` | IA | Eliminar 8 warnings de deprecation de SQLAlchemy 2.0 |
| Helpers `validation_error_response` y `not_found_response` | IA | Eliminar duplicación: el bloque 422 aparecía 4 veces y el 404 aparecía 6 veces |
| Mantener `/apidocs` (default Flasgger) en vez de `/api-docs` | Humano | Simplicidad, sin custom config |
| No agregar ESLint para frontend | Humano | No bloqueante para la entrega |
| `docker-compose.override.yml` para puerto 5433 (conflicto con otro Postgres en 5432) | IA | No tocar contenedores ajenos al proyecto |
| Healthcheck `pg_isready` en compose | IA | Backend fallaba al arrancar antes que la BD |
| Cobertura mínima elevada de 80% → 85% | Humano | Mayor exigencia, alcanzable con tests adicionales |

---

## Resultado de la colaboración

- **Backend**: 99% de cobertura sobre `app/` (42 tests, 0 warnings).
- **Frontend**: 7 componentes + 2 páginas + servicio API, build limpio.
- **Gitflow**: 14 features mergeadas vía PR + rama `feature/cumplimiento-spec-y-limpieza`
  para correcciones finales + `release/1.0.0`.
- **Documentación**: README con 6 secciones, SPEC actualizado al estado real,
  Swagger UI con 8 endpoints documentados con `definitions` reutilizables.
- **Limpieza**: cero `print()`, cero `console.log`, cero TODO/FIXME, cero código
  comentado, flake8 limpio, helpers para eliminar duplicación.

---

## Lecciones

1. **Verificar después de cada commit** evita rollbacks costosos. Cuando se omitió este
   paso (ej. remover `import React`), apareció un bug de pantalla en blanco.
2. **No asumir que los containers tienen el código actualizado**: hacer `docker compose
   build` o restart después de cambios en backend.
3. **El SPEC puede evolucionar** con la implementación; mantenerlo sincronizado al final
   refleja honestamente el estado del proyecto.
4. **Las desviaciones explícitamente aceptadas no son fallas**: documentarlas en el SPEC
   y en este archivo deja un rastro claro.
