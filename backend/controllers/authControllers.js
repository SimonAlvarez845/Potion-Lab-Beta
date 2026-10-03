const authService = require("../services/authService");
// permite que el Controller acceda a las funciones del Service (servicio.funcion)

// Recibe los datos del usuario de req.body, delega el registro al service y responde con el usuario creado y su token.
const register = async (req, res) => {
  const { usuario, token } = await authService.registrar(req.body);
  res
    .status(201)
    .json({ mensaje: "Usuario registrado correctamente", usuario, token });
};

// Recibe las credenciales de req.body, delega la autenticacion al service y responde con el usuario autenticado y su token.
const login = async (req, res) => {
  const { usuario, token } = await authService.iniciarSesion(req.body);
  res
    .status(200)
    .json({ mensaje: "Sesión iniciada correctamente", usuario, token });
};

module.exports = {
  register,
  login,
};
