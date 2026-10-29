import api from "./api";
import { normalizarUsuario } from "../utils/normalizarImagenes";

// Envia las credenciales al Backend y devuelve un Usuario y JWT.
export async function iniciarSesionAPI(email, password) {
  const respuesta = await api.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return {
    ...respuesta.data,
    usuario: normalizarUsuario(respuesta.data.usuario),
  };
}

// Registra un usuario nuevo en MongoDB.
export async function registrarUsuarioAPI(datos) {
  const respuesta = await api.post("/auth/register", {
    nombreCompleto: datos.nombreCompleto.trim(),
    email: datos.email.trim().toLowerCase(),
    password: datos.password,
    especialidad: datos.especialidad,
    avatarUrl: datos.avatarUrl.trim(),
  });

  return respuesta.data;
}

// Recupera el perfil usando el JWT enviado por Axios.
export async function obtenerMiPerfilAPI() {
  const respuesta = await api.get("/usuarios/me");
  return normalizarUsuario(respuesta.data.usuario);
}
