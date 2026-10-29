import api from "./api";

// Obtiene las formulas almacenadas en MongoDB.
export async function obtenerFormulasAPI() {
  const respuesta = await api.get("/formulas");
  return respuesta.data.formulas;
}

// Consulta el detalle de una formula.
export async function obtenerFormulaAPI(formulaId) {
  const respuesta = await api.get(`/formulas/${formulaId}`);
  return respuesta.data.formula;
}

// Crea una propuesta usando las validaciones del Backend.
export async function crearFormulaAPI(datos) {
  const respuesta = await api.post("/formulas", datos);
  return respuesta.data.formula;
}

// Solicita al Backend abrir la votación de una formula.
export async function abrirVotacionAPI(formulaId) {
  const respuesta = await api.post(`/formulas/${formulaId}/abrir`);
  return respuesta.data.formula;
}

// Registra o actualiza el voto de un usuario en MongoDB.
export async function votarFormulaAPI(formulaId, datos) {
  const respuesta = await api.put(`/formulas/${formulaId}/voto`, datos);
  return respuesta.data.formula;
}

// Cierra una votación en MongoDB y devuelve la formula con sus resultados finales.
export async function cerrarVotacionAPI(formulaId) {
  const respuesta = await api.post(`/formulas/${formulaId}/cerrar`);
  return respuesta.data.formula;
}

// Destila una fórmula cerrada y guarda la poción en MongoDB.
export async function destilarFormulaAPI(formulaId) {
  const respuesta = await api.post(`/formulas/${formulaId}/destilar`);
  return respuesta.data.formula;
}
