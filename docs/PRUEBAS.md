# Plan de verificación — Potion Lab Beta

Este documento define **pruebas propuestas**, no afirma que todas se hayan ejecutado. Anotar fecha, responsable, resultado y evidencia cuando se comprueben.

## Matriz de pruebas

| ID | Área | Procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| FE-01 | Build | Ejecutar `npm run build` en raíz | Vite genera `dist/` sin errores | Por registrar |
| FE-02 | Calidad | Ejecutar `npm run lint` | Sin errores bloqueantes | Por registrar |
| FE-03 | Rutas | Recargar `/formulas` directamente en Netlify | La SPA carga, sin 404 | Por registrar |
| FE-04 | Sesión | Login, recarga, logout | Recuperación del JWT y salida correcta | Por registrar |
| FE-05 | Formularios | Enviar valores inválidos | Validación visible; no crear registros | Por registrar |
| API-01 | Salud | `GET /api/salud` | HTTP 200 y `ok: true` | Por registrar |
| API-02 | Swagger | Visitar `/api/docs` | Swagger UI carga el contrato | Por registrar |
| API-03 | OpenAPI | Visitar `/api/openapi.json` | JSON válido OpenAPI 3.0.3 | Por registrar |
| API-04 | Autorización | `GET /api/usuarios/me` sin JWT | Acceso rechazado | Por registrar |
| API-05 | Autenticación | Login + `GET /api/usuarios/me` | Identidad correcta | Por registrar |
| API-06 | Roles | Realizar una acción no autorizada | Respuesta de error adecuada | Por registrar |
| API-07 | Validación | Crear fórmula con dificultad inválida | Validación rechaza la petición | Por registrar |
| INT-01 | Persistencia | Crear recurso y recargar | El recurso permanece en MongoDB | Por registrar |
| INT-02 | Tiempo real | Votar con dos navegadores abiertos | Segunda sesión observa el cambio | Por registrar |
| INT-03 | Ciclo | Proponer, abrir, votar, cerrar, destilar | Solo transiciones autorizadas | Por registrar |
| INT-04 | Grimorio | Consultar una poción destilada | Resultado disponible y persistente | Por registrar |
| DEP-01 | Netlify | Abrir https://potionlab.netlify.app/ | Frontend público disponible | Por registrar |
| DEP-02 | Render | Abrir endpoint de salud público | Backend disponible | Por registrar |
| DEP-03 | Responsive | Probar viewport móvil | Interfaz utilizable y sin desbordamiento crítico | Por registrar |
| SEC-01 | Repositorio | Revisar archivos versionados | Sin secretos, `.env`, `node_modules`, `dist` | Por registrar |

## Comprobaciones mínimas en PowerShell

Desde la raíz del repositorio:

```powershell
npm run build
npm run lint
git status --short
git ls-files | Select-String -Pattern '(^|/)(node_modules|dist)(/|$)|(^|/).env$'
```

La última consulta debería devolver **cero coincidencias**. No copiar contraseñas reales, JWT ni URIs privadas en capturas de evidencia.

## Validación de permisos

Probar con usuarios de roles distintos las operaciones de creación de gremios, gestión de miembros, cambio de roles, nombramiento de Catador, apertura/cierre de votaciones, veto y destilación. El resultado válido depende de membresía, rol y estado de la fórmula.

## Precauciones

Swagger `Try it out` envía peticiones HTTP reales: `POST`, `PUT`, `PATCH` y `DELETE` pueden alterar datos persistentes. Usar una base de pruebas o recursos descartables; **no ejecutar el seed en producción** para realizar la demostración.

## Registro de evidencia

Para cada prueba registrar `ID / fecha / entorno / usuario o rol / resultado / evidencia / observaciones`. Capturar tanto la respuesta del backend como el comportamiento observable en la interfaz cuando sea relevante.
