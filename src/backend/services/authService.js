async function login({ email, password }) {
  const usuario = await Usuario.findOne({ email }).select("+password");

  if (!usuario) {
    throw {
      status: 401,
      message: "Las credenciales son incorrectas",
    };
  }

  const passwordValido = await usuario.comparePassword(password);

  if (!passwordValido) {
    throw {
      status: 401,
      message: "La contraseña es incorrecta",
    };
  }

  const token = generateToken(usuario);

  usuario.password = undefined;

  return { usuario, token };
}
