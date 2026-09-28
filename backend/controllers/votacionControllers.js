const servicio = require("../services/votacionService");

// Recibe opción y usuario autenticado; delega el voto y devuelve la fórmula actualizada.
async function votar(req, res, next) {
  try { res.json({ formula: await servicio.votar(req.params.id, req.usuario, req.body) }); } catch (error) { next(error); }
}
// Recibe la opción vetada; el service verifica el cargo y devuelve la fórmula.
async function vetar(req, res, next) {
  try { res.json({ formula: await servicio.vetar(req.params.id, req.usuario, req.body) }); } catch (error) { next(error); }
}
// Recibe la fórmula; delega permisos, cierre y desempate y devuelve el resultado persistido.
async function cerrar(req, res, next) {
  try { res.json({ formula: await servicio.cerrar(req.params.id, req.usuario) }); } catch (error) { next(error); }
}
module.exports = { votar, vetar, cerrar };
