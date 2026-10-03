// Consulta el rol de un usuario dentro de un gremio, mas no el rol global del usuario
function obtenerRol(gremio, usuarioId) {
  return (
    gremio.miembros.find(
      (miembro) => String(miembro.usuarioId) === String(usuarioId),
    )?.rol || "Visitante" // Visitante no es un miembro almacenado, es simplemente un tag que elegimos para representar a alguien que no esta en miembros
  );
}

// Los servicios comparten esta comprobación para no depender de botones ocultos en React (en edge case: alguien se los intenta saltar)
function exigirRol(gremio, usuarioId, permitidos) {
  if (!permitidos.includes(obtenerRol(gremio, usuarioId))) {
    const error = new Error(
      "Tu rol en este gremio no permite realizar esta operación",
    );
    error.status = 403;
    throw error;
  }
}

module.exports = { obtenerRol, exigirRol };
