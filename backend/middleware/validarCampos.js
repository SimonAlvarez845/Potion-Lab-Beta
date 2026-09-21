const { validationResult } = require("express-validator");

// Metodo que recoge los errores producidos por las reglas del usuario que pondremos en la ruta.
const validarCampos = (req, res, next) => {
  const errores = validationResult(req);

  // Si aparece un error lo transforma en una respuesta sencilla
  if (!errores.isEmpty()) {
    const mensajes = errores.array().map((error) => ({
      campo: error.path,
      mensaje: error.msg,
    }));

    // para detener la peticion
    return res.status(400).json({
      ok: false,
      errores: mensajes,
    });
  }

  next();
};

module.exports = validarCampos;
