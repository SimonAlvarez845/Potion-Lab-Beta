import api from "./api";

// Obtiene las pociones destiladas que estan guardadas en MongoDB.
export async function obtenerGrimorioAPI() {
  const respuesta = await api.get("/grimorio");
  return respuesta.data.pociones;
}
