const servicio = require("../services/gremioService");

// Recibe filtros y usuario, delega el directorio y devuelve gremios seguros.
async function listar(req, res) {
  res.json({ gremios: await servicio.listar(req.usuario._id, req.query) });
}
// Recibe el id, consulta el service y presenta el gremio para el usuario autenticado.
async function obtener(req, res) {
  const gremio = await servicio.obtenerGremio(req.params.id);
  res.json({ gremio: servicio.presentarGremio(gremio, req.usuario._id) });
}
// Recibe datos básicos, delega la creación y devuelve 201.
async function crear(req, res) {
  res.status(201).json({ gremio: await servicio.crear(req.usuario, req.body) });
}
// Recibe código opcional; el service verifica ingreso y devuelve la membresía actualizada.
async function unirse(req, res) {
  res.json({
    gremio: await servicio.unirse(
      req.params.id,
      req.usuario._id,
      req.body?.codigo,
    ),
  });
}
// Recibe miembro y rol permitido; el service verifica al administrador.
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
// Recibe el candidato a Catador y delega el reemplazo del anterior.
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
// Recibe al miembro que sale; el service distingue salida propia de expulsión.
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
