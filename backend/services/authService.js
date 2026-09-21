const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");

// Aca es donde realmente se crea el token con .sign
const generateToken = (usuario) => {
  
  return jwt.sign(
    {
      id: usuario._id,
      role: usuario.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// Crea un nuevo usuario y devuelve sus datos junto con un token.
async function registrar({ nombre, email, password }) {
  
  // Usuario representa el schema completo y nos permite hacer operaciones como 
  // Usuario.findOne(), Usuario.create(), Usuario.findById()
  
  // Busca y guarda un usuario que tenga el correo recibido
  const usuarioExistente = await Usuario.findOne({ email });

  // Comprueba si el correo de ese usuario existe
  if (usuarioExistente) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
  }

  // Crea el usuario en Mongo
  const nuevoUsuario = await Usuario.create({
    nombre,
    email,
    password,
  });

  // Genera y le asina un Token para identificarlo
  const token = generateToken(nuevoUsuario);

  // Devolvemos una respuesta sin incluir la contraseña cifrada.
  const usuario = {
    id: nuevoUsuario._id,
    nombre: nuevoUsuario.nombre,
    email: nuevoUsuario.email,
    role: nuevoUsuario.role,
  };

  return {
    usuario,
    token,
  };
}

module.exports = {
  registrar,
};