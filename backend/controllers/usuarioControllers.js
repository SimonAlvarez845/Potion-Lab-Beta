const usuarioService = require("../services/usuarioService");
// Permite que el Controller acceda a las funciones del Service (authService.funcion)

// Recibe el usuario autenticado de req.body,
// delega la consulta al service y responde con su perfil.
const obtenerPerfil = async (req, res) => {
  const usuario = await usuarioService.obtenerPerfil(req.usuario);
  res.status(200).json({ usuario });
};

// Recibe el usuario autenticado y los cambios de req.body,
// delega la actualización al service y responde con el perfil actualizado.
const actualizarPerfil = async (req, res) => {
  const usuario = await usuarioService.actualizarPerfil(req.usuario, req.body);
  res
    .status(200)
    .json({ mensaje: "Perfil actualizado correctamente", usuario });
};

async function listar(req, res) {
  const usuarios = await usuarioService.listarUsuarios(req.query.gremioId, req.usuario._id);
  res.json({ usuarios });
}

async function ranking(req, res) {
  const usuarios = await usuarioService.listarUsuarios(req.query.gremioId, req.usuario._id, true);
  res.json({ usuarios });
}

async function rankingGremio(req, res) {
  const usuarios = await usuarioService.listarUsuarios(req.params.id, req.usuario._id, true);
  res.json({ usuarios });
}

module.exports = { obtenerPerfil, actualizarPerfil, listar, ranking, rankingGremio };
