const authService = require("../services/authService");

// registra al usuario cuando todo es válido
const register = async (req, res) => {
  const { usuario, token } = await authService.registrar(req.body);
  res
    .status(201)
    .json({ mensaje: "Usuario registrado correctamente", usuario, token });
};

module.exports = {
  register,
};
