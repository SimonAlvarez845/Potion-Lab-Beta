const Formula = require("../models/formula");
const { obtenerGremio } = require("./gremioService");
const { exigirRol } = require("../utils/roles");

// Comparte la búsqueda entre consultas, votos y destilación sin repetir el caso 404.
async function obtenerFormula(id) {
  const formula = await Formula.findById(id);
  if (!formula) {
    const error = new Error("La fórmula no existe");
    error.status = 404;
    throw error;
  }
  return formula;
}

// Convierte referencias a strings y presenta los eventos con el formato que muestra React.
function presentarFormula(formula) {
  return {
    id: String(formula._id),
    gremioId: String(formula.gremioId),
    creadaPorId: String(formula.creadaPorId),
    nombrePocion: formula.nombrePocion,
    efectoDeseado: formula.efectoDeseado,
    dificultad: formula.dificultad,
    estado: formula.estado,
    fechaCreacion: formula.fechaCreacion,
    fechaCierre: formula.fechaCierre,
    fechaAperturaVotacion: formula.fechaAperturaVotacion,
    fechaCierreEfectivo: formula.fechaCierreEfectivo,
    categorias: formula.categorias,
    veto: null,
    auditoria: formula.auditoria.map((e) => ({
      id: String(e._id),
      formulaId: String(formula._id),
      fecha: e.fecha,
      titulo: e.titulo,
      detalle: e.detalle,
      ...(e.usuarioId ? { usuarioId: String(e.usuarioId) } : {}),
    })),
  };
}

// La interfaz permite hasta el final del séptimo día: usamos la zona del proyecto, Bogotá (UTC-5).
function validarFechaCierre(fecha) {
  const ahora = Date.now();
  const limiteLocal = new Date(ahora - 5 * 60 * 60 * 1000);
  limiteLocal.setUTCDate(limiteLocal.getUTCDate() + 7);
  limiteLocal.setUTCHours(23, 59, 59, 999);
  const cierre = new Date(fecha).getTime();
  if (
    !Number.isFinite(cierre) ||
    cierre <= ahora ||
    cierre > limiteLocal.getTime() + 5 * 60 * 60 * 1000
  ) {
    const error = new Error(
      "El cierre debe ser futuro y estar entre hoy y los próximos siete días",
    );
    error.status = 400;
    throw error;
  }
}

// Solo GM/sénior con participación suficiente crean propuestas; el servidor decide autor y categorías.
async function crear(usuario, datos) {
  const gremio = await obtenerGremio(datos.gremioId);
  exigirRol(gremio, usuario._id, ["Gran Maestre", "Alquimista sénior"]);
  if (usuario.participacion < 30) {
    const error = new Error(
      "Necesitas al menos 30% de participación para proponer",
    );
    error.status = 403;
    throw error;
  }
  validarFechaCierre(datos.fechaCierre);
  const formula = await Formula.create({
    gremioId: gremio._id,
    creadaPorId: usuario._id,
    nombrePocion: datos.nombrePocion,
    efectoDeseado: datos.efectoDeseado,
    dificultad: datos.dificultad,
    fechaCierre: datos.fechaCierre,
    auditoria: [
      {
        titulo: "Propuesta creada",
        detalle: `${usuario.nombre} registró la fórmula base.`,
        usuarioId: usuario._id,
      },
    ],
  });
  return presentarFormula(formula);
}

// Filtra por relaciones y estado; la búsqueda textual no interpreta expresiones regulares del cliente.
async function listar(filtros) {
  const consulta = {};
  if (filtros.gremioId) consulta.gremioId = filtros.gremioId;
  if (filtros.estado) consulta.estado = filtros.estado;
  const formulas = await Formula.find(consulta).sort({ fechaCreacion: -1 });
  const texto = (filtros.q || "").toLowerCase();
  return formulas
    .filter((f) =>
      `${f.nombrePocion} ${f.efectoDeseado}`.toLowerCase().includes(texto),
    )
    .map(presentarFormula);
}

// Abrir solo admite proposal -> voting y nunca revive una propuesta con plazo vencido.
async function abrir(id, usuario) {
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);
  exigirRol(gremio, usuario._id, ["Gran Maestre", "Alquimista sénior"]);
  if (formula.estado !== "proposal" || formula.fechaCierre <= new Date()) {
    const error = new Error("Solo se abre una propuesta con plazo vigente");
    error.status = 409;
    throw error;
  }
  formula.estado = "voting";
  formula.fechaAperturaVotacion = new Date();
  formula.auditoria.push({
    titulo: "Votación abierta",
    detalle: `${usuario.nombre} abrió la votación.`,
    usuarioId: usuario._id,
  });
  await formula.save();
  return presentarFormula(formula);
}

module.exports = {
  obtenerFormula,
  presentarFormula,
  validarFechaCierre,
  crear,
  listar,
  abrir,
};
