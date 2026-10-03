// si authService detecta un problema lo redirige para aca

// NOTE: formato para que Express reconozca Error Handlers(error, request, response, next)

// Middleware central de errores: recibe los errores que llegan desde Routes, otros Middlewares, Services o Mongoose y los convierte en respuestas .JSON con su respectivo codigo HTTP.

// NOTE: Express reconoce un middleware de errores por sus 4 parámetros:
// (error, request, response, next).

function manejarErrores(error, req, res, next) {
  // Para ayudar al programador mostramos el tipo/código del error en consola.
  // No imprimimos valores recibidos porque una validación podría incluir info sensible (claves).
  console.error(
    "Error:",
    error.name || "Error",
    error.status || error.code || 500,
  );

  // Caso 1: el cuerpo enviado no contiene un JSON válido.
  if (error.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ ok: false, mensaje: "El cuerpo debe ser JSON válido" });
  }

  // Caso 2: MongoDB detectó un valor duplicado en un campo unique (Email Repetido).
  if (error.code === 11000) {
    // Todos los modelos tienen índices únicos
    const campo = Object.keys(error.keyPattern || {})[0];
    let mensaje = "El registro ya existe";

    if (campo === "email") {
      mensaje = "El email ya esta registrado";
    } else if (campo === "nombreNormalizado") {
      mensaje = "Ya existe un gremio con ese nombre";
    } else if (campo === "codigoInvitacion") {
      mensaje = "Codigo de invitación repetido";
    }

    return res.status(409).json({ ok: false, mensaje });
  }

  // Caso 3: los datos no cumplen las validaciones definidas en Mongoose.
  if (error.name === "ValidationError") {
    return res.status(400).json({
      ok: false,
      mensaje: "Los datos enviados no son válidos",
    });
  }

  // Caso 4: Mongoose no puede convertir un valor al tipo esperado (ID invalido).
  if (error.name === "CastError") {
    return res.status(400).json({
      ok: false,
      mensaje: "ID inválido en la base de datos",
    });
  }

  // Caso 5: cualquier otro error. Si el error no trae un codigo HTTP, usamos 500 por defecto.
  const status = error.status || 500;

  let mensaje;

  // Mostramos el motivo de errores conocidos, pero aca es donde realmente ocultamos los detalles de errores internos del servidor.
  if (status === 500) {
    mensaje = "Error interno del servidor, intente luego";
  } else {
    mensaje = error.message;
  }

  // Devuelve error usando codigo HTTP y mensaje custom (garantizando que todo error este manejado y clasificado de forma custom).
  return res.status(status).json({
    ok: false,
    mensaje,
  });
}

module.exports = manejarErrores;
