const servicio = require("../services/votacionService");
// Permite que el Controller acceda a las funciones del Service.

// Recibe el id de la fórmula de req.params, el usuario autenticado de req.usuario y la categoría y opción elegidas de req.body. Delega el registro del voto al service y devuelve la fórmula actualizada.
async function votar(req, res, next) {
  try {
    // Guardamos el voto en MongoDB usando el Service.
    const formula = await servicio.votar(req.params.id, req.usuario, req.body);

    // Recuperamos la instancia de Socket.IO compartida en index.js del backend
    const io = req.app.get("io");

    // Notificamos a los clientes solamente despues de guardar el voto.
    io.emit("votacion:actualizada", {
      formulaId: formula.id,
      resultados: formula.resultados,
    });

    // Respondemos a la HTTP request con la formula actualizada.
    res.json({ formula });
  } catch (error) {
    next(error);
  }
}

// Recibe el id de la fórmula de req.params, el usuario autenticado de req.usuario, la categoría y opción a vetar de req.body. Luego delega la validación de permisos y aplicación del veto al service y devuelve la formula actualizada.
async function vetar(req, res, next) {
  try {
    res.json({
      formula: await servicio.vetar(req.params.id, req.usuario, req.body),
    });
  } catch (error) {
    next(error);
  }
}

// Recibe el id de la fórmula de req.params y el usuario autenticado de req.usuario. Delega la validación de permisos y el calculo de ganadores al service. Devuelve una formula cerrada con sus resultados.
async function cerrar(req, res, next) {
  try {
    res.json({
      formula: await servicio.cerrar(req.params.id, req.usuario),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { votar, vetar, cerrar };
