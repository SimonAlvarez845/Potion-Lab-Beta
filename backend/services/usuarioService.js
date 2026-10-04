// Service de usuario: prepara la información que enviamos al frontend
// y controla qué datos puede modificar el usuario de su propio perfil.

const Usuario = require("../models/usuario");
const { obtenerEstadisticas } = require("./estadisticasService");

// Recibe el usuario completo de Mongo y construye el objeto que queremos enviar al frontend, evitando exponer campos como password y _id
function presentarUsuario(usuario, estadisticas = {}) {
  // _id es un ObjectId de Mongo
  return {
    id: usuario._id.toString(),
    // Mantenemos ambos nombres por compatibilidad con el frontend, aunque en MongoDB guardamos un unico campo "nombre".
    nombre: usuario.nombre,
    nombreCompleto: usuario.nombre,
    email: usuario.email,
    especialidad: usuario.especialidad,
    avatarUrl: usuario.avatarUrl,
    role: usuario.role,
    participacion: estadisticas.participacion ?? 100,
    precisionCatador: estadisticas.precisionCatador ?? 0,
    // FALTA
    puntos: estadisticas.puntos ?? 0,
    rarezaTotal: estadisticas.rarezaTotal ?? 0,
    restriccionFormulasHasta: usuario.restriccionFormulasHasta || null,
  };
}

// Devuelve el perfil autenticado usando el mismo formato seguro
// que utilizamos para enviar usuarios al frontend.
async function obtenerPerfil(usuario) {
  const estadisticas = await obtenerEstadisticas();
  const actualizado = await Usuario.findById(usuario._id);
  return presentarUsuario(actualizado, estadisticas[String(usuario._id)]);
}

// Actualiza únicamente los campos del perfil que el usuario tiene permitido modificar.
// datos --> req.body
async function actualizarPerfil(usuario, datos) {
  // Whitelist
  const permitidos = [
    "nombre",
    "nombreCompleto",
    "email",
    "especialidad",
    "avatarUrl",
  ];
  if (Object.keys(datos).some((campo) => !permitidos.includes(campo))) {
    const error = new Error("El perfil contiene campos no permitidos");
    error.status = 400;
    throw error;
  }

  // Si el frontend envía ambos nombres, exigimos que tengan el mismo valor.
  if (
    datos.nombre !== undefined &&
    datos.nombreCompleto !== undefined &&
    datos.nombre !== datos.nombreCompleto
  ) {
    const error = new Error("nombre y nombreCompleto deben coincidir");
    error.status = 400;
    throw error;
  }

  // Nunca aplicamos req.body completo sobre el documento.
  // Como es un PATCH, comprobamos cada campo contra undefined
  // solo modificamos los campos enviados y dejamos intactos todo lo demas.
  if (datos.nombreCompleto !== undefined) usuario.nombre = datos.nombreCompleto;
  else if (datos.nombre !== undefined) usuario.nombre = datos.nombre;
  if (datos.email !== undefined) usuario.email = datos.email;
  if (datos.especialidad !== undefined)
    usuario.especialidad = datos.especialidad;
  if (datos.avatarUrl !== undefined) usuario.avatarUrl = datos.avatarUrl;

  // Guardamos los cambios en MongoDB mediante Mongoose.
  await usuario.save();

  return obtenerPerfil(usuario);
}

async function listarUsuarios(gremioId, actorId, ordenar = false) {
  let consulta = {};
  if (gremioId) {
    const { obtenerGremio } = require("./gremioService");
    const { exigirRol } = require("../utils/roles");
    const gremio = await obtenerGremio(gremioId);
    exigirRol(gremio, actorId, ["Gran Maestre", "Alquimista sénior", "Catador oficial", "Aprendiz"]);
    consulta = { _id: { $in: gremio.miembros.map((m) => m.usuarioId) } };
  }
  const usuarios = await Usuario.find(consulta)
    .select("nombre especialidad avatarUrl participacion precisionCatador restriccionFormulasHasta");
  const estadisticas = await obtenerEstadisticas(gremioId);
  const lista = usuarios.map((usuario) => {
    const perfil = presentarUsuario(usuario, estadisticas[String(usuario._id)]);
    delete perfil.email;
    delete perfil.role;
    return perfil;
  });
  if (ordenar) {
    lista.sort((a, b) => b.puntos - a.puntos || b.rarezaTotal - a.rarezaTotal || a.id.localeCompare(b.id));
  }
  return lista;
}

module.exports = { presentarUsuario, obtenerPerfil, actualizarPerfil, listarUsuarios };
