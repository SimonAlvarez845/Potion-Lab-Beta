import api from "./api";

// Consulta los perfiles reales de MongoDB.
export async function obtenerUsuariosAPI() {
  const respuesta = await api.get("/usuarios");
  return respuesta.data.usuarios;
}
