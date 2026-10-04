const { actualizarPlazos } = require("../services/plazosService");

// Revisamos los plazos pendientes antes de continuar con la petición.
async function actualizar(req, res, next) {
  await actualizarPlazos();
  next();
}

module.exports = actualizar;
