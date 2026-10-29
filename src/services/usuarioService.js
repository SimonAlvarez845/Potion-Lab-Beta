import api from "./api";

// Consulta los perfiles reales de MongoDB.
export async function obtenerUsuariosAPI() {
  const respuesta = await api.get("/usuarios");
  return respuesta.data.usuarios;
}

// Consulta el ranking actualizado y ordenado por el Backend.
export async function obtenerRankingAPI() {
  const respuesta = await api.get("/usuarios/ranking");
  return respuesta.data.usuarios;
}

// Guarda los cambios del perfil autenticado en MongoDB.
export async function actualizarPerfilAPI(datos) {
  const respuesta = await api.patch("/usuarios/me", datos);
  return respuesta.data.usuario;
}
