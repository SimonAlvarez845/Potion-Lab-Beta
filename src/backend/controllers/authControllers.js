const authService = require("../services/authService");
const asyncHandler = require ("express async-handler");

const register = (async(req, res) => {
  const { usuario, token } = await authService.registrar(req.body);
  res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario, token})
});

module.exports = {
  register,
};
