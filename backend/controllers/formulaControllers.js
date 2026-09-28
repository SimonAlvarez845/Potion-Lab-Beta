const servicio = require("../services/formulaService");

// Recibe filtros de consulta, delega la búsqueda y devuelve las fórmulas.
async function listar(req, res) { res.json({ formulas: await servicio.listar(req.query) }); }
// Recibe id y devuelve la fórmula con su auditoría.
async function obtener(req, res) { res.json({ formula: servicio.presentarFormula(await servicio.obtenerFormula(req.params.id)) }); }
// Recibe datos y autor autenticado; el service comprueba permisos y crea la propuesta.
async function crear(req, res) { res.status(201).json({ formula: await servicio.crear(req.usuario, req.body) }); }
// Recibe la fórmula a abrir y delega la transición autorizada.
async function abrir(req, res) { res.json({ formula: await servicio.abrir(req.params.id, req.usuario) }); }
module.exports = { listar, obtener, crear, abrir };
