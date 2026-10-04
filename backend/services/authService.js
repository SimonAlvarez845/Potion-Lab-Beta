const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const { presentarUsuario, obtenerPerfil } = require("./usuarioService");

// Service de Autenticación: contiene la lógica de negocio
// necesaria para registrar usuarios e iniciar sesión.

// Crea un JWT que identifica al usuario mediante su id y role.
// Ese token vence después de 1 día (buena práctica)
const generateToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      role: usuario.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

// Crea un nuevo usuario y devuelve sus datos junto con un token.
async function registrar(datos) {
  // Whitelist
  const permitidos = [
    "nombre",
    "nombreCompleto",
    "email",
    "password",
    "especialidad",
    "avatarUrl",
  ];
  if (Object.keys(datos).some((campo) => !permitidos.includes(campo))) {
    const error = new Error(
      "Su registro contiene campos no permitidos. Porfavor intente de nuevo",
    );
    error.status = 400;
    throw error;
  }

  // Sacamos los campos del objeto
  const { nombre, nombreCompleto, email, password, especialidad, avatarUrl } =
    datos;

  // Si el frontend envía ambos nombres, exigimos que tengan el mismo valor.
  if (
    nombre !== undefined &&
    nombreCompleto !== undefined &&
    nombre !== nombreCompleto
  ) {
    const error = new Error("nombre y nombreCompleto deben coincidir");
    error.status = 400;
    throw error;
  }

  // Usuario representa el schema completo y nos permite hacer operaciones como
  // Usuario.findOne(), Usuario.create(), Usuario.findById()

  // Si encontramos uno, impedimos registrar el mismo email nuevamente.
  const usuarioExistente = await Usuario.findOne({ email });

  // Comprueba si el correo de ese usuario existe
  if (usuarioExistente) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
  }

  // Creamos y guardamos el usuario en MongoDB.
  // Al guardarse, el pre("save") de usuario.js (Modelo) cifra la contraseña.
  const nuevoUsuario = await Usuario.create({
    nombre: nombreCompleto ?? nombre,
    email,
    password,
    especialidad,
    avatarUrl,
  });

  // Generamos un JWT para que dicho usuario pueda autenticarse luego en las rutas protegidas.
  const token = generateToken(nuevoUsuario);

  // Preparamos una versión segura del usuario sin datos sensibles.
  const usuario = presentarUsuario(nuevoUsuario);

  return {
    usuario,
    token,
  };
}

// Busca al usuario por email, comprueba su contraseña
// y devuelve sus datos junto con un nuevo token.
async function iniciarSesion({ email, password }) {
  // password está oculto por defecto: solo lo seleccionamos para compararlo.
  const usuario = await Usuario.findOne({ email }).select("+password");

  // Si el usuario no existe o la contraseña no coincide, rechazamos el login.
  if (!usuario || !(await usuario.comparePassword(password))) {
    const error = new Error("El correo o la contraseña no coinciden");
    error.status = 401;
    throw error;
  }

  const { actualizarPlazos } = require("./plazosService");
  await actualizarPlazos();
  return { usuario: await obtenerPerfil(usuario), token: generateToken(usuario) };
}

module.exports = {
  registrar,
  iniciarSesion,
};
