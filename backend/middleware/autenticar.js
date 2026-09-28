const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Usuario = require("../models/usuario");

// Middleware de autenticación que protege las rutas.
// Si algo falla siempre devuelve 401, si funciona guarda
// el usuario autenticado en req.usuario y deja continuar la petición.

async function autenticar(req, res, next) {
  // Obtenemos el header Authorization y lo separamos en: ["Bearer", "token"].
  const autorizacion = req.get("Authorization") || "";
  const partes = autorizacion.trim().split(/\s+/);

  // El formato esperado es exactamente: Bearer <token>.
  if (
    partes.length !== 2 ||
    partes[0].toLowerCase() !== "bearer" ||
    !partes[1]
  ) {
    const error = new Error("Se requiere un token Bearer");
    error.status = 401;
    throw error;
  }

  // Una configuración ausente es un fallo del servidor, no del usuario.
  if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET no esta bien configurado");

  let contenido;

  // partes[1] --> token
  // secret --> clave
  // verify --> firma

  // Aca se comprueba la firma del token usando el secret y, si es valida, devuelve el contenido que guardamos en el JWT.
  try {
    contenido = jwt.verify(partes[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (causa) {
    const error = new Error(
      causa.name === "TokenExpiredError"
        ? "El token ha vencido"
        : "El token no es válido",
    );
    error.status = 401;
    throw error;
  }

  // Verificamos que token tenga contenido, exista, sea de tipo string y este en un formato valido para que MongoDB lo pueda reconocer
  if (
    !contenido ||
    typeof contenido.id !== "string" ||
    !mongoose.isObjectIdOrHexString(contenido.id)
  ) {
    const error = new Error("El token no es válido");
    error.status = 401;
    throw error;
  }

  // Confirmamos que el usuario guardado en el token todavia exista en MongoDB.
  const usuario = await Usuario.findById(contenido.id);
  if (!usuario) {
    const error = new Error("El usuario de la sesión ya no existe");
    error.status = 401;
    throw error;
  }

  // Metemos el usuario encontrado en Mongo dentro de la propia peticion para que el Middleware y los Controllers lo puedan utilizar
  req.usuario = usuario;

  // Puede continuar la petición
  next();
}

module.exports = autenticar;
