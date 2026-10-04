const servicio = require("../services/destilacionService");

async function destilar(req, res) {
  const formula = await servicio.destilar(req.params.id, req.usuario);
  res.json({ formula });
}

async function listar(req, res) {
  const pociones = await servicio.listarGrimorio(req.query);
  res.json({ pociones });
}

module.exports = { destilar, listar };
