const servicio = require("../services/formulaService");
// Permite que el Controller acceda a las funciones del Service (servicio.funcion).

// Recibe los filtros de req.query, delega la busqueda al service y devuelve una lista de formulas.
async function listar(req, res) {
  res.json({ formulas: await servicio.listar(req.query) });
}

// Recibe el id de la fórmula de req.params, delega la consulta al service y responde con datos de la fórmula y su historial.
async function obtener(req, res) {
  const formula = await servicio.obtenerFormula(req.params.id);
  res.json({ formula: servicio.presentarFormula(formula) });
}

// Recibe el usuario autenticado de req.usuario y los datos de req.body, delega la creación al service y responde con la fórmula creada.
async function crear(req, res) {
  res.status(201).json({
    formula: await servicio.crear(req.usuario, req.body),
  });
}

// Recibe el id de la formula de req.params y el usuario de req.usuario, delega la apertura de votación al service y devuelve la formula actualizada.
async function abrir(req, res) {
  res.json({
    formula: await servicio.abrir(req.params.id, req.usuario),
  });
}

module.exports = {
  listar,
  obtener,
  crear,
  abrir,
};
