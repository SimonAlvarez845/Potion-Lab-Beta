const usuarioService = require("../services/usuarioService");
// Permite que el Controller acceda a las funciones del Service (authService.funcion)

// Recibe el usuario autenticado de req.body,
// delega la consulta al service y responde con su perfil.
const obtenerPerfil = (req, res) => {
  const usuario = usuarioService.obtenerPerfil(req.usuario);
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

module.exports = { obtenerPerfil, actualizarPerfil };
