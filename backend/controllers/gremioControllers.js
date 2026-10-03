const servicio = require("../services/gremioService");
// Permite que el Controller acceda a las funciones del Service (authService.funcion)

// Recibe un usuario ya autenticado de req.usuario y los filtros de req.query, delega la busqueda al service y devuelve una lista de gremios.
async function listar(req, res) {
  res.json({ gremios: await servicio.listar(req.usuario._id, req.query) });
}

// Recibe el id del gremio de req.params y el usuario de req.usuario, delega la consulta al service y responde con los datos del gremio.
async function obtener(req, res) {
  const gremio = await servicio.obtenerGremio(req.params.id);
  res.json({ gremio: servicio.presentarGremio(gremio, req.usuario._id) });
}

// Recibe el usuario autenticado de req.usuario y sus datos de req.body, delega la creacion al service y responde con el gremio creado.
async function crear(req, res) {
  res.status(201).json({ gremio: await servicio.crear(req.usuario, req.body) });
}

// Recibe el id del gremio de req.params, el usuario de req.usuario y el código de invitacion de req.body, delega el cambio al service y responde con la actualizacion.
async function unirse(req, res) {
  res.json({
    gremio: await servicio.unirse(
      req.params.id,
      req.usuario._id,
      req.body?.codigo,
    ),
  });
}

// Recibe el miembro y el gremio de req.params, el usuario de req.usuario, y el nuevo rol de req.body, delega el cambio al service y responde con el gremio actualizado.
async function cambiarRol(req, res) {
  res.json({
    gremio: await servicio.cambiarRol(
      req.params.id,
      req.usuario._id,
      req.params.usuarioId,
      req.body.rol,
    ),
  });
}

// Recibe el gremio de req.params, el usuario de req.usuario y el nuevo Catador de req.body, delega el nombramiento al service y responde con la actualizacion.
async function nombrarCatador(req, res) {
  res.json({
    gremio: await servicio.cambiarRol(
      req.params.id,
      req.usuario._id,
      req.body.usuarioId,
      "Catador oficial",
    ),
  });
}

// Recibe el gremio y miembro de req.params y el usuario de req.usuario, delega su salida al service y responde con el gremio actualizado.
async function retirarMiembro(req, res) {
  res.json({
    gremio: await servicio.retirarMiembro(
      req.params.id,
      req.usuario._id,
      req.params.usuarioId,
    ),
  });
}

module.exports = {
  listar,
  obtener,
  crear,
  unirse,
  cambiarRol,
  nombrarCatador,
  retirarMiembro,
};
