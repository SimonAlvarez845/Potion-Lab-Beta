// Consulta el rol del gremio, nunca el role global de Usuario.
function obtenerRol(gremio, usuarioId) {
  return gremio.miembros.find((miembro) => String(miembro.usuarioId) === String(usuarioId))?.rol || "Visitante";
}

// Los servicios comparten esta comprobación para no depender de botones ocultos en React.
function exigirRol(gremio, usuarioId, permitidos) {
  if (!permitidos.includes(obtenerRol(gremio, usuarioId))) {
    const error = new Error("Tu rol en este gremio no permite esta operación");
    error.status = 403;
    throw error;
  }
}

module.exports = { obtenerRol, exigirRol };
