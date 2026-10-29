import api from "./api";
import { normalizarUsuario } from "../utils/normalizarImagenes";

// Consulta los perfiles reales de MongoDB.
export async function obtenerUsuariosAPI() {
  const respuesta = await api.get("/usuarios");
  return respuesta.data.usuarios.map(normalizarUsuario);
}

// Consulta el ranking actualizado y ordenado por el Backend.
export async function obtenerRankingAPI() {
  const respuesta = await api.get("/usuarios/ranking");
  return respuesta.data.usuarios.map(normalizarUsuario);
}

// Guarda los cambios del perfil autenticado en MongoDB.
export async function actualizarPerfilAPI(datos) {
  const respuesta = await api.patch("/usuarios/me", datos);
  return normalizarUsuario(respuesta.data.usuario);
}
