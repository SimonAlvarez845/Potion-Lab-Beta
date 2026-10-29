# API REST de Potion Lab Beta — Guía de Swagger

Esta guía acompaña la especificación [OpenAPI 3.0.3](openapi.json). Documenta cómo consultar la API, autenticarse y recorrer sus **24 operaciones**. Swagger no sustituye las validaciones ni los permisos del backend.

## Acceso

| Recurso | Local | Producción |
| --- | --- | --- |
| Interfaz Swagger UI | http://localhost:3000/api/docs | https://potion-lab-beta.onrender.com/api/docs |
| Especificación JSON | http://localhost:3000/api/openapi.json | https://potion-lab-beta.onrender.com/api/openapi.json |
| Salud de la API | http://localhost:3000/api/salud | https://potion-lab-beta.onrender.com/api/salud |

`swagger.js` monta la interfaz y expone el JSON desde `backend/index.js`. Swagger ya está incluido como dependencia `swagger-ui-express`.

## Ejecución local

Desde la carpeta `backend/`:

```powershell
npm install
Copy-Item .env.example .env
# Configura en .env una URI válida de MongoDB y JWT_SECRET
npm run dev
```

No publiques el archivo `.env`. El inicio del servidor necesita conexión válida con MongoDB y configuración JWT.

## Autenticación con JWT

1. Abre `POST /api/auth/login` (o `/api/auth/register`) en Swagger.
2. Selecciona **Try it out**, completa el JSON y ejecuta.
3. Copia el campo `token` de la respuesta.
4. Pulsa **Authorize** y pega **solo el token JWT**, sin anteponer `Bearer`.
5. Prueba una ruta protegida como `GET /api/usuarios/me`.

El cliente Swagger añade el encabezado `Authorization: Bearer <JWT>` en las operaciones protegidas. Un token inválido o expirado no da acceso.

## Catálogo de endpoints

| Método | Ruta | Propósito |
| --- | --- | --- |
| GET | `/api/salud` | Comprobar disponibilidad del backend |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Autenticar usuario |
| GET | `/api/usuarios` | Consultar usuarios |
| GET | `/api/usuarios/ranking` | Consultar ranking general |
| GET | `/api/usuarios/me` | Obtener perfil autenticado |
| PATCH | `/api/usuarios/me` | Actualizar perfil propio |
| GET | `/api/gremios` | Consultar y filtrar gremios |
| POST | `/api/gremios` | Crear gremio |
| GET | `/api/gremios/{id}` | Consultar detalle del gremio |
| GET | `/api/gremios/{id}/ranking` | Ranking del gremio |
| POST | `/api/gremios/{id}/miembros` | Unirse a gremio |
| PATCH | `/api/gremios/{id}/miembros/{usuarioId}/rol` | Actualizar rol de miembro |
| PUT | `/api/gremios/{id}/catador` | Nombrar Catador oficial |
| DELETE | `/api/gremios/{id}/miembros/{usuarioId}` | Salida o retiro de miembro |
| GET | `/api/formulas` | Buscar y filtrar fórmulas |
| POST | `/api/formulas` | Crear propuesta |
| GET | `/api/formulas/{id}` | Ver fórmula e historial |
| POST | `/api/formulas/{id}/abrir` | Abrir votación |
| PUT | `/api/formulas/{id}/voto` | Registrar o cambiar voto |
| POST | `/api/formulas/{id}/veto` | Aplicar veto autorizado |
| POST | `/api/formulas/{id}/cerrar` | Cerrar votación |
| POST | `/api/formulas/{id}/destilar` | Destilar resultado final |
| GET | `/api/grimorio` | Consultar pociones destiladas |

Salvo login, registro y salud, las rutas de negocio utilizan autenticación JWT. **Los permisos específicos** dependen del rol, la membresía y el estado de cada fórmula; un JWT válido no garantiza autorización para todas las acciones.

## Ejemplos de petición

### Iniciar sesión

```http
POST /api/auth/login
Content-Type: application/json

{"email":"usuario@ejemplo.com","password":"tu-clave"}
```

### Consultar perfil

```http
GET /api/usuarios/me
Authorization: Bearer <JWT>
```

### Crear una fórmula

```http
POST /api/formulas
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "gremioId": "507f1f77bcf86cd799439011",
  "nombrePocion": "Elixir del Eclipse",
  "efectoDeseado": "Aumentar la concentración",
  "dificultad": 2,
  "fechaCierre": "2030-10-30T20:00:00.000Z"
}
```

El identificador es ilustrativo: reemplázalo por un gremio real al ejecutar. La fecha debe ser futura y cumplir el límite de plazo validado por el backend. No ejecutar este ejemplo sin adaptar esos datos.

## Respuestas y errores

Las rutas devuelven JSON. Según el escenario, los errores pueden incluir `{ "ok": false, "mensaje": "..." }` o información de validación en `errores`. Consultar en Swagger los esquemas y códigos por operación; las respuestas reales se comprueban con pruebas de integración.

## Flujo de prueba recomendado

Autenticarse → consultar gremios → crear gremio si corresponde → crear propuesta → abrir votación → registrar votos → cerrar → destilar → consultar Grimorio.

**Precaución:** `POST`, `PUT`, `PATCH` y `DELETE` hacen cambios reales. Para prácticas, utilizar datos descartables y una base separada cuando sea posible; no volver a ejecutar el seed sobre la base de producción.

## Documentación relacionada

- [Arquitectura general](ARQUITECTURA.md)
- [Guía técnica del frontend](FRONTEND.md)
- [Plan de pruebas](PRUEBAS.md)
- [Auditoría del contrato](AUDITORIA-SWAGGER.md)

La cobertura de rutas es de **24/24** frente a las declaraciones de Express revisadas, pero la validación detallada de respuestas y permisos permanece documentada como trabajo pendiente en la auditoría.
