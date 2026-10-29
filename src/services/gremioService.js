import api from "./api";

// Consulta los gremios guardados en MongoDB usando el JWT.
export async function obtenerGremiosAPI() {
  const respuesta = await api.get("/gremios");
  return respuesta.data.gremios;
}

// Crea un gremio en MongoDB y devuelve el objeto creado por Express.
export async function crearGremioAPI(datos) {
  const respuesta = await api.post("/gremios", datos);
  return respuesta.data.gremio;
}

// Incorpora al usuario autenticado a un gremio.
export async function unirseAGremioAPI(gremioId, codigo = "") {
  const respuesta = await api.post(`/gremios/${gremioId}/miembros`, {
    codigo,
  });

  return respuesta.data.gremio;
}

// Cambia el rol de un miembro del gremio.
export async function cambiarRolGremioAPI(gremioId, usuarioId, rol) {
  const respuesta = await api.patch(
    `/gremios/${gremioId}/miembros/${usuarioId}/rol`,
    { rol },
  );

  return respuesta.data.gremio;
}

// Nombra al Catador oficial del gremio.
export async function nombrarCatadorAPI(gremioId, usuarioId) {
  const respuesta = await api.put(`/gremios/${gremioId}/catador`, {
    usuarioId,
  });

  return respuesta.data.gremio;
}

// Retira a un miembro del gremio y devuelve su estado actualizado.
export async function retirarMiembroAPI(gremioId, usuarioId) {
  const respuesta = await api.delete(
    `/gremios/${gremioId}/miembros/${usuarioId}`,
  );

  return respuesta.data.gremio;
}
