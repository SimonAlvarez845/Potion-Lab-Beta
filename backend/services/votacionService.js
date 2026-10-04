const Formula = require("../models/formula");
const { obtenerFormula, presentarFormula } = require("./formulaService");
const { obtenerGremio } = require("./gremioService");
const { obtenerRol, exigirRol } = require("../utils/roles");
const { obtenerPesoVoto, calcularGanadores } = require("./resultadosService");

// Comprueba que la votación siga abierta, dentro del plazo y que la opción exista.
function comprobarOpcion(formula, categoriaId, opcionId) {
  if (formula.estado !== "voting" || formula.fechaCierre <= new Date()) {
    const error = new Error("La votacion no esta abierta o su plazo vencio");
    error.status = 409;
    throw error;
  }

  const categoria = formula.categorias.find((c) => c.id === categoriaId);

  if (!categoria?.opciones.some((o) => o.id === opcionId)) {
    const error = new Error("Su categoria no existe");
    error.status = 400;
    throw error;
  }
}

// Recibe la formula original y los campos que queremos modificar y los actualiza.
async function guardarVotacion(formula, cambios) {
  const guardada = await Formula.findOneAndUpdate(
    {
      _id: formula._id,
      __v: formula.__v,
      estado: "voting",
      fechaCierre: { $gt: new Date() },
    },
    {
      $set: cambios,
      $inc: { __v: 1 },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // Evita sobrescribir otro voto guardado al mismo tiempo.
  if (!guardada) {
    const error = new Error(
      "La fórmula cambio o vencio; porfavor recargue antes de reintentar",
    );
    error.status = 409;
    throw error;
  }

  return presentarFormula(guardada);
}

// Consulta y comprueba permisos de plazo, opción y veto antes de realizar la votacion. Sirve para registrar o reemplazar el voto de un usuario.
async function votar(id, usuario, datos) {
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);

  exigirRol(gremio, usuario._id, [
    "Gran Maestre",
    "Alquimista sénior",
    "Catador oficial",
    "Aprendiz",
  ]);

  comprobarOpcion(formula, datos.categoriaId, datos.opcionId);

  // No se permite votar por una opción que ya fue vetada.
  if (
    formula.veto?.categoriaId === datos.categoriaId &&
    formula.veto?.opcionId === datos.opcionId
  ) {
    const error = new Error("No puedes votar por una opción vetada");
    error.status = 409;
    throw error;
  }

  // Busca si el usuario ya votó en esta categoría.
  const anterior = formula.votos.find(
    (v) =>
      String(v.usuarioId) === String(usuario._id) &&
      v.categoriaId === datos.categoriaId,
  );

  // Calculo del peso segun especialidad y cargo dentro del gremio.
  const voto = {
    usuarioId: usuario._id,
    categoriaId: datos.categoriaId,
    opcionId: datos.opcionId,
    peso: obtenerPesoVoto(
      usuario,
      datos.categoriaId,
      obtenerRol(gremio, usuario._id) === "Catador oficial",
    ),
    // Conservamos la fecha del primer voto aunque el usuario cambie su elección.
    fechaPrimerVoto: anterior?.fechaPrimerVoto || new Date(),
    fecha: new Date(),
  };

  // Si ya voto, cambia su elección. Si no, agrega el nuevo voto.
  if (anterior) {
    Object.assign(anterior, voto);
  } else {
    formula.votos.push(voto);
  }

  return guardarVotacion(formula, { votos: formula.votos });
}

// Comprueba que sea Catador oficial, que la opción exista y que no haya otro veto, devuelve la formula actualizada.
async function vetar(id, usuario, datos) {
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);

  exigirRol(gremio, usuario._id, ["Catador oficial"]);

  comprobarOpcion(formula, datos.categoriaId, datos.opcionId);

  // Solo se permite un veto por fórmula.
  if (formula.veto) {
    const error = new Error("Esta fórmula ya utilizó su veto");
    error.status = 409;
    throw error;
  }

  formula.veto = {
    usuarioId: usuario._id,
    categoriaId: datos.categoriaId,
    opcionId: datos.opcionId,
    fecha: new Date(),
  };

  // Registra el evento sin eliminar el historial de votos.
  formula.auditoria.push({
    titulo: "Veto aplicado",
    detalle: `${usuario.nombre} vetó ${datos.opcionId}.`,
    usuarioId: usuario._id,
  });

  return guardarVotacion(formula, {
    veto: formula.veto,
    auditoria: formula.auditoria,
  });
}

// Comprueba que un usuario tenga permisos y que la votación esté abierta, luego calcula los ganadores, cierra la fórmula y la devuelve.
async function cerrar(id, usuario) {
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);

  exigirRol(gremio, usuario._id, ["Gran Maestre", "Alquimista sénior"]);

  if (formula.estado !== "voting") {
    const error = new Error("Solo se cierra una votación abierta");
    error.status = 409;
    throw error;
  }

  // Calcula y guarda los ganadores para no repetir los desempates.
  formula.ganadores = calcularGanadores(formula, gremio);
  formula.estado = "closed";
  formula.fechaCierreEfectivo = new Date();

  formula.auditoria.push({
    titulo: "Votación cerrada",
    detalle: "Ganadores y desempates guardados.",
    usuarioId: usuario._id,
  });

  await formula.save();

  return presentarFormula(formula);
}

module.exports = { votar, vetar, cerrar };
