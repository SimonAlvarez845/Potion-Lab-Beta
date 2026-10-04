# Documentación de la API — Potion Lab

Desde la carpeta `backend` ejecuta `npm install` y `npm run dev`. Requiere `JWT_SECRET` y la configuración de MongoDB documentada en `.env.example`.

- Interfaz interactiva: http://localhost:3000/api/docs
- Contrato JSON: http://localhost:3000/api/openapi.json
- Salud: http://localhost:3000/api/salud

Usa **POST /api/auth/register** o **POST /api/auth/login**. Copia el valor del campo `token`, pulsa **Authorize** y pega **solo el token**. Luego usa **Try it out** en las rutas protegidas.

Flujo de ejemplo: registra/inicia sesión → crea un gremio → crea fórmula con fecha de cierre futura dentro de 7 días → abre votación → emite votos → cierra → consulta el grimorio. Algunas acciones requieren un rol adecuado. **Try it out escribe datos reales:** prueba preferiblemente contra una base de pruebas. La documentación no modifica las reglas de negocio ni conecta el frontend.

Los errores HTTP incluyen un objeto `{ ok: false, mensaje }` o, en validaciones, `{ ok: false, errores: [...] }`. Swagger documenta contratos y ejemplos: no sustituye pruebas integradas con MongoDB.
