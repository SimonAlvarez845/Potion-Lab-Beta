// Modulo de Node que utilizaremos para generar codigos de invitacion aleatorios
const crypto = require("node:crypto");

const Gremio = require("../models/gremio");
const { obtenerRol, exigirRol } = require("../utils/roles");

// Busca un gremio por su ID y lanza un error si no existe.
async function obtenerGremio(id) {
  const gremio = await Gremio.findById(id);
  if (!gremio) {
    const error = new Error("El gremio no existe");
    error.status = 404;
    throw error;
  }
  return gremio;
}

// Recibe el usuario completo de Mongo y construye el objeto que queremos enviar al frontend, evitando exponer campos como el código a quien no administra el gremio.
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

// Busca y devuelve los gremios que el usuario quiere ver en el buscador
async function listar(usuarioId, filtros) {
  const consulta =
    filtros.mios === "true" ? { "miembros.usuarioId": usuarioId } : {};
  // Busca unicamente los gremios a los que pertenece

  const gremios = await Gremio.find(consulta).sort({ createdAt: -1 });
  // Ordenelos del mas reciente al mas antiguo

  // Obtiene el input del usuario
  const texto = (filtros.q || "").toLowerCase();

  // Recorre los gremios y comprueba si su nombre o lema contiene el texto
  return (
    gremios
      .filter((g) => `${g.nombre} ${g.lema}`.toLowerCase().includes(texto))

      // Llamado a la de funcion de arriba
      .map((g) => presentarGremio(g, usuarioId))
  );
}

// Registra un nuevo gremio en MongoDB, genera su codigo de invitacion y vuelve al creador Gran Maestre. Me apoye con IA.
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

// Se encarga de manejar la logica de cambiar el rol de un miembro dentro de un gremio
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
    const error = new Error("No puedes modificar al Gran Maestre");
    error.status = 403;
    throw error;
  }
  if (
    rol === "Alquimista sénior" &&
    gremio.miembros.filter((m) => m !== miembro && m.rol === rol).length >= 3
  ) {
    const error = new Error("El gremio solo admite tres Alquimistas senior");
    error.status = 409;
    throw error;
  }

  if (rol === "Catador oficial" && miembro.rol === rol) {
    return presentarGremio(gremio, actorId);
  }

  // Nombrar un Catador reemplaza al anterior, quien vuelve a Aprendiz.
  if (rol === "Catador oficial") {
    gremio.miembros.forEach((m) => {
      if (m.rol === rol) m.rol = "Aprendiz";
    });
  }

  // Asignamos el nuevo rol al rol que tiene actualmente el miembro dentro del gremio.
  miembro.rol = rol;

  if (rol === "Catador oficial") {
    miembro.fechaNombramientoCatador = new Date();
  }

  await gremio.save();

  return presentarGremio(gremio, actorId);
}

// Permite que un usuario abandone un gremio o que el Gran Maestre expulse otro miembro
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

  // Aca es donde realmente se retira el miembro
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
