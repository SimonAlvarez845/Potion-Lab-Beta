const Formula = require("../models/formula");
const { obtenerFormula, presentarFormula } = require("./formulaService");
const { obtenerGremio } = require("./gremioService");
const { obtenerRol, exigirRol } = require("../utils/roles");
const { obtenerPesoVoto, calcularGanadores } = require("./resultadosService");

// Ningún voto o veto se recibe fuera de plazo ni sobre opciones enviadas por el cliente.
function comprobarOpcion(formula, categoriaId, opcionId) {
  if (formula.estado !== "voting" || formula.fechaCierre <= new Date()) {
    const error = new Error("La votación no está abierta o su plazo venció"); error.status = 409; throw error;
  }
  const categoria = formula.categorias.find((c) => c.id === categoriaId);
  if (!categoria?.opciones.some((o) => o.id === opcionId)) {
    const error = new Error("Categoría u opción inexistente"); error.status = 400; throw error;
  }
}

// Una actualización condicional evita perder votos simultáneos o escribir después del cierre.
// El 409 pide recargar y reintentar; no aceptamos silenciosamente un voto que no se guardó.
async function guardarVotacion(formula, cambios) {
  const guardada = await Formula.findOneAndUpdate({ _id: formula._id, __v: formula.__v,
    estado: "voting", fechaCierre: { $gt: new Date() } },
  { $set: cambios, $inc: { __v: 1 } }, { new: true, runValidators: true });
  if (!guardada) { const error = new Error("La fórmula cambió o venció; recarga antes de reintentar"); error.status = 409; throw error; }
  return presentarFormula(guardada);
}

// Cada miembro tiene un voto por categoría; cambiarlo reemplaza opción y peso, nunca suma otro.
async function votar(id, usuario, datos) {
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);
  exigirRol(gremio, usuario._id, ["Gran Maestre", "Alquimista sénior", "Catador oficial", "Aprendiz"]);
  comprobarOpcion(formula, datos.categoriaId, datos.opcionId);
  if (formula.veto?.categoriaId === datos.categoriaId && formula.veto?.opcionId === datos.opcionId) {
    const error = new Error("No puedes votar por una opción vetada"); error.status = 409; throw error;
  }
  const anterior = formula.votos.find((v) => String(v.usuarioId) === String(usuario._id) && v.categoriaId === datos.categoriaId);
  const voto = { usuarioId: usuario._id, categoriaId: datos.categoriaId, opcionId: datos.opcionId,
    peso: obtenerPesoVoto(usuario, datos.categoriaId, obtenerRol(gremio, usuario._id) === "Catador oficial"),
    fechaPrimerVoto: anterior?.fechaPrimerVoto || new Date(), fecha: new Date() };
  if (anterior) Object.assign(anterior, voto);
  else formula.votos.push(voto);
  return guardarVotacion(formula, { votos: formula.votos });
}

// Un Catador puede vetar una sola opción en toda la fórmula; sus votos históricos se conservan.
async function vetar(id, usuario, datos) {
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);
  exigirRol(gremio, usuario._id, ["Catador oficial"]);
  comprobarOpcion(formula, datos.categoriaId, datos.opcionId);
  if (formula.veto) { const error = new Error("Esta fórmula ya utilizó su veto"); error.status = 409; throw error; }
  formula.veto = { usuarioId: usuario._id, categoriaId: datos.categoriaId, opcionId: datos.opcionId, fecha: new Date() };
  formula.auditoria.push({ titulo: "Veto aplicado", detalle: `${usuario.nombre} vetó ${datos.opcionId}.`, usuarioId: usuario._id });
  return guardarVotacion(formula, { veto: formula.veto, auditoria: formula.auditoria });
}

// GM/sénior cierra y congela ganadores. optimisticConcurrency impide sobrescribir votos recientes.
async function cerrar(id, usuario) {
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);
  exigirRol(gremio, usuario._id, ["Gran Maestre", "Alquimista sénior"]);
  if (formula.estado !== "voting") { const error = new Error("Solo se cierra una votación abierta"); error.status = 409; throw error; }
  formula.ganadores = calcularGanadores(formula, gremio);
  formula.estado = "closed";
  formula.fechaCierreEfectivo = new Date();
  formula.auditoria.push({ titulo: "Votación cerrada", detalle: "Ganadores y desempates guardados.", usuarioId: usuario._id });
  await formula.save();
  return presentarFormula(formula);
}

module.exports = { votar, vetar, cerrar };
