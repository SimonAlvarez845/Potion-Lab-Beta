const crypto = require("node:crypto");
const Gremio = require("../models/gremio");
const { obtenerRol, exigirRol } = require("../utils/roles");

// Busca el gremio utilizado por miembros, fórmulas y permisos; diferencia inexistencia de falta de permiso.
async function obtenerGremio(id) {
  const gremio = await Gremio.findById(id);
  if (!gremio) {
    const error = new Error("El gremio no existe");
    error.status = 404;
    throw error;
  }
  return gremio;
}

// Devuelve los nombres del frontend y oculta el código a quien no administra el gremio.
function presentarGremio(gremio, usuarioId) {
  return {
    id: String(gremio._id),
    nombre: gremio.nombre,
    lema: gremio.lema,
    descripcion: gremio.descripcion,
    tipo: gremio.tipo,
    emblemaUrl: gremio.emblemaUrl,
    acento: gremio.acento,
    creadoPorId: String(gremio.creadoPorId),
    miembros: gremio.miembros.map((m) => ({
      usuarioId: String(m.usuarioId),
      rol: m.rol,
      fechaIngreso: m.fechaIngreso,
    })),
    ...(obtenerRol(gremio, usuarioId) === "Gran Maestre"
      ? { codigoInvitacion: gremio.codigoInvitacion }
      : {}),
  };
}

// El directorio conserva la consulta global del frontend; privado limita el ingreso, no la lectura.
async function listar(usuarioId, filtros) {
  const consulta =
    filtros.mios === "true" ? { "miembros.usuarioId": usuarioId } : {};
  const gremios = await Gremio.find(consulta).sort({ createdAt: -1 });
  const texto = (filtros.q || "").toLowerCase();
  return gremios
    .filter((g) => `${g.nombre} ${g.lema}`.toLowerCase().includes(texto))
    .map((g) => presentarGremio(g, usuarioId));
}

// El creador queda como único Gran Maestre; el cliente no puede asignarse otros miembros ni un código.
async function crear(usuario, datos) {
  let codigoInvitacion;
  do {
    codigoInvitacion = crypto.randomBytes(3).toString("hex").toUpperCase();
  } while (await Gremio.exists({ codigoInvitacion }));
  const gremio = await Gremio.create({
    nombre: datos.nombre,
    nombreNormalizado: datos.nombre.toLowerCase(),
    lema: datos.lema,
    descripcion: datos.descripcion || `Gremio creado por ${usuario.nombre}.`,
    tipo: datos.tipo,
    emblemaUrl: datos.emblemaUrl,
    codigoInvitacion,
    creadoPorId: usuario._id,
    miembros: [{ usuarioId: usuario._id, rol: "Gran Maestre" }],
  });
  return presentarGremio(gremio, usuario._id);
}

// Unirse es directo; los gremios privados comprueban su código y todos ingresan como Aprendiz.
async function unirse(id, usuarioId, codigo = "") {
  const gremio = await obtenerGremio(id);
  if (obtenerRol(gremio, usuarioId) !== "Visitante") {
    const error = new Error("Ya perteneces a este gremio");
    error.status = 409;
    throw error;
  }
  if (
    gremio.tipo === "privado" &&
    gremio.codigoInvitacion !== codigo.trim().toUpperCase()
  ) {
    const error = new Error("El código de invitación no es válido");
    error.status = 403;
    throw error;
  }
  gremio.miembros.push({ usuarioId, rol: "Aprendiz" });
  await gremio.save();
  return presentarGremio(gremio, usuarioId);
}

// Solo el Gran Maestre cambia roles; no se transfiere ese cargo y hay máximo tres séniores.
async function cambiarRol(id, actorId, miembroId, rol) {
  const gremio = await obtenerGremio(id);
  exigirRol(gremio, actorId, ["Gran Maestre"]);
  const miembro = gremio.miembros.find(
    (m) => String(m.usuarioId) === String(miembroId),
  );
  if (!miembro) {
    const error = new Error("El miembro no existe");
    error.status = 404;
    throw error;
  }
  if (miembro.rol === "Gran Maestre") {
    const error = new Error("No se puede modificar al Gran Maestre");
    error.status = 403;
    throw error;
  }
  if (
    rol === "Alquimista sénior" &&
    gremio.miembros.filter((m) => m !== miembro && m.rol === rol).length >= 3
  ) {
    const error = new Error(
      "El gremio admite como máximo tres Alquimistas sénior",
    );
    error.status = 409;
    throw error;
  }
  // Nombrar un Catador reemplaza al anterior, quien vuelve a Aprendiz.
  if (rol === "Catador oficial") {
    gremio.miembros.forEach((m) => {
      if (m.rol === rol) m.rol = "Aprendiz";
    });
  }
  miembro.rol = rol;
  await gremio.save();
  return presentarGremio(gremio, actorId);
}

// La salida propia y la expulsión por el Gran Maestre conservan al responsable del gremio.
async function retirarMiembro(id, actorId, miembroId) {
  const gremio = await obtenerGremio(id);
  if (String(actorId) !== String(miembroId))
    exigirRol(gremio, actorId, ["Gran Maestre"]);
  const rol = obtenerRol(gremio, miembroId);
  if (rol === "Visitante") {
    const error = new Error("El miembro no existe");
    error.status = 404;
    throw error;
  }
  if (rol === "Gran Maestre") {
    const error = new Error(
      "El Gran Maestre no puede abandonar ni ser expulsado",
    );
    error.status = 403;
    throw error;
  }
  gremio.miembros = gremio.miembros.filter(
    (m) => String(m.usuarioId) !== String(miembroId),
  );
  await gremio.save();
  return presentarGremio(gremio, actorId);
}

module.exports = {
  obtenerGremio,
  presentarGremio,
  listar,
  crear,
  unirse,
  cambiarRol,
  retirarMiembro,
};
