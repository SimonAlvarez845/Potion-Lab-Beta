# Auditoría del contrato OpenAPI — 29 de octubre de 2026

## Alcance

Se compararon las declaraciones de rutas en `backend/index.js`, `backend/routes/auth.js`, `usuarios.js`, `gremios.js`, `formulas.js` y `grimorio.js` con las rutas y métodos de `backend/docs/openapi.json`.

## Resultado

| Revisión | Resultado |
| --- | --- |
| Operaciones REST declaradas en Express | 24 |
| Operaciones registradas en OpenAPI | 24 |
| Correspondencia de método y ruta | 24 de 24 |
| Especificación | OpenAPI 3.0.3 |
| Esquemas definidos | 17 |
| Seguridad declarada | `bearerAuth` HTTP JWT |
| UI | `/api/docs` |
| JSON | `/api/openapi.json` |

**Advertencia:** la correspondencia de rutas no prueba que todos los códigos HTTP, ejemplos, campos o restricciones de permisos sean idénticos al comportamiento real. Tampoco sustituye las pruebas de integración.

## Operaciones por módulo

| Módulo | Métodos y rutas |
| --- | --- |
| Sistema | `GET /api/salud` |
| Autenticación | `POST /api/auth/register`, `POST /api/auth/login` |
| Usuarios | `GET /api/usuarios`, `GET /api/usuarios/ranking`, `GET /api/usuarios/me`, `PATCH /api/usuarios/me` |
| Gremios | `GET /api/gremios`, `POST /api/gremios`, `GET /api/gremios/{id}`, `GET /api/gremios/{id}/ranking`, `POST /api/gremios/{id}/miembros`, `PATCH /api/gremios/{id}/miembros/{usuarioId}/rol`, `PUT /api/gremios/{id}/catador`, `DELETE /api/gremios/{id}/miembros/{usuarioId}` |
| Fórmulas | `GET /api/formulas`, `POST /api/formulas`, `GET /api/formulas/{id}`, `POST /api/formulas/{id}/abrir` |
| Votación | `PUT /api/formulas/{id}/voto`, `POST /api/formulas/{id}/veto`, `POST /api/formulas/{id}/cerrar` |
| Destilación | `POST /api/formulas/{id}/destilar` |
| Grimorio | `GET /api/grimorio` |

## Aspectos pendientes de validación profunda

1. Confirmar `security: bearerAuth` en cada operación protegida; login, registro y salud deben poder llamarse sin JWT.
2. Comparar esquemas de entrada con `express-validator`: campos obligatorios, tipos, rangos y enumeraciones.
3. Confirmar las respuestas HTTP y formatos de errores (`400`, `401`, `403`, `404`, `409`, `500`) contra los controladores y middleware.
4. Verificar reglas de rol, membresía, veto, cierre por plazo y destilación en los servicios de negocio.
5. Corroborar que los esquemas de salida no expongan información sensible, especialmente contraseñas.
6. Validar el JSON contra OpenAPI 3.0.3 con una herramienta de validación antes de publicarlo como contrato exhaustivamente auditado.

## Observaciones de integración

- El frontend renombrado localmente de `src/` a `frontend/` exige actualizar la documentación de estructura, pero no modifica los endpoints REST.
- El ejemplo de entorno del backend incluye `FRONTEND_URL`, mientras que la configuración Socket.IO consulta `CORS_ORIGIN`. Corregir esa discrepancia **en una tarea separada**, fuera de este commit limitado a documentación.
- `backend/docs/swagger.js` ya expone Swagger UI y el JSON; no hace falta añadir otra librería.
- No ejecutar operaciones de escritura mediante Swagger contra datos de producción que deban conservarse.

**Este commit documental no modifica `backend/docs/openapi.json` ni el código de aplicación.**
