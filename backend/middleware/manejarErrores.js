// si authService detecta un problema lo redirige para aca

// NOTE: formato para que Express reconozca Error Handlers(error, request, response, next)

// es la central de clasificacion de errores
// expresamos los posibles errores en formato claro, JSON y con su respectivo codigo HTTP
function manejarErrores(error, req, res, next) {
  // para ayudar al programador, muestra el error en consola
  console.error("Error:", error.message);

  // Caso 1: Error de Validacion de Mongoose
  if (error.name === "ValidationError") {
    return res.status(400).json({
      ok: false,
      mensaje: error.message,
    });
  }

  // Caso 2: ID Invalido
  if (error.name === "CastError") {
    return res.status(400).json({
      ok: false,
      mensaje: "ID inválido en la base de datos",
    });
  }

  // Caso 3: Cualquier Otro Error

  // Si el error no tiene estado, use 500 por defecto
  const status = error.status || 500;

  let mensaje;

  // se penso asi para que muestre el motivo de errores conocidos pero oculte los detalles de errores internos mas complejos
  if (status === 500) {
    mensaje = "Error interno del servidor, intente luego";
  } else {
    mensaje = error.message;
  }

  // Seleccione y devuelva uno de los casos
  return res.status(status).json({
    ok: false,
    mensaje,
  });
}

module.exports = manejarErrores;
