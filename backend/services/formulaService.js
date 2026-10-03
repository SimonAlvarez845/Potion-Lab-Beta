const Formula = require("../models/formula");
const { obtenerGremio } = require("./gremioService");
const { exigirRol } = require("../utils/roles");
const { calcularResultados } = require("./resultadosService");

// Busca una fórmula por su ID y lanza un error si no existe.
async function obtenerFormula(id) {
  const formula = await Formula.findById(id);

  if (!formula) {
    const error = new Error("La fórmula no existe");
    error.status = 404;
    throw error;
  }

  return formula;
}

// Prepara los datos de la fórmula para enviarlos a React.
// Convierte los ObjectId a texto y organiza su historial.
function presentarFormula(formula) {
  // React agrupa votos por usuario y categoría; Mongo los guarda dentro de la fórmula.
  const votos = {};

  for (const voto of formula.votos) {
    const usuarioId = String(voto.usuarioId);

    if (!votos[usuarioId]) {
      votos[usuarioId] = {};
    }

    votos[usuarioId][voto.categoriaId] = {
      opcionId: voto.opcionId,
      peso: voto.peso,
      fecha: voto.fecha,
    };
  }

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
    votos,

    veto: formula.veto
      ? {
          categoriaId: formula.veto.categoriaId,
          opcionId: formula.veto.opcionId,
          usuarioId: String(formula.veto.usuarioId),
          fecha: formula.veto.fecha,
        }
      : null,

    resultados: formula.categorias.map((categoria) => ({
      categoriaId: categoria.id,
      opciones: calcularResultados(categoria, formula.votos, formula.veto),
    })),

    ganadores: formula.ganadores,

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

// Comprueba que el cierre sea futuro y esté dentro de los próximos 7 días.
// Usamos UTC-5 y permitimos cerrar hasta las 11:59 p. m. del último día.
// Esto lo busque y se creo a partir de la logica del frontend.
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

// Solo el Gran Maestre o un Alquimista sénior con al menos 30% de participación puede crear una propuesta.
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
        detalle: `${usuario.nombre} registro la formula base.`,
        usuarioId: usuario._id,
      },
    ],
  });

  return presentarFormula(formula);
}

// Aquí sí aplicamos los filtros validados en routes. MongoDB filtra por gremio y estado, nosotros buscamos manualmente coincidencias de texto.
async function listar(filtros) {
  const consulta = {};

  if (filtros.gremioId) {
    consulta.gremioId = filtros.gremioId;
  }

  if (filtros.estado) {
    consulta.estado = filtros.estado;
  }

  // orden descendente
  const formulas = await Formula.find(consulta).sort({
    fechaCreacion: -1,
  });

  const texto = (filtros.q || "").toLowerCase();

  return formulas
    .filter((f) =>
      `${f.nombrePocion} ${f.efectoDeseado}`.toLowerCase().includes(texto),
    )
    .map(presentarFormula);
}

// Solo el Gran Maestre o un Alquimista sénior puede abrir la votación. La formula debe seguir como propuesta y no tener el plazo vencido.
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
