// Maneja los roles de los usuarios y valida que accion puede realizar cada uno.

// Devuelve objeto o undefined
export function obtenerMiembro(gremio, usuarioId) {
  return gremio?.miembros.find((miembro) => miembro.usuarioId === usuarioId);
}

// Devuelve string
export function obtenerRol(gremio, usuarioId) {
  return obtenerMiembro(gremio, usuarioId)?.rol ?? "Visitante";
}

// Devuelve bool
export function puedeAdministrarGremio(gremio, usuarioId) {
  return obtenerRol(gremio, usuarioId) === "Gran Maestre";
}

// Devuelve bool
export function puedeCrearFormula(gremio, usuario) {
  const rol = obtenerRol(gremio, usuario.id);
  const rolPermitido = ["Gran Maestre", "Alquimista sénior"].includes(rol);
  return rolPermitido && usuario.participacion >= 30;
}

// Devuelve bool
export function esCatadorOficial(gremio, usuarioId) {
  return obtenerRol(gremio, usuarioId) === "Catador oficial";
}
