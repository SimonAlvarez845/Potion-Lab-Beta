const router = require("express").Router();
const { body, param, query } = require("express-validator");
const autenticar = require("../middleware/autenticar");
const validarCampos = require("../middleware/validarCampos");
const controller = require("../controllers/gremioControllers");
router.use(autenticar);

// GET /api/gremios — consulta el directorio o los gremios propios.
router.get("/", [query("q").optional().isString(), query("mios").optional().isIn(["true", "false"])], validarCampos, controller.listar);
// POST /api/gremios — crea el gremio y su Gran Maestre.
router.post("/", [
  body("nombre").isString().bail().trim().isLength({ min: 1, max: 50 }),
  body("lema").isString().bail().trim().isLength({ min: 1, max: 90 }),
  body("descripcion").optional().isString().bail().trim().isLength({ max: 500 }),
  body("tipo").optional().isIn(["publico", "privado"]),
  body("emblemaUrl").optional().isString().bail().trim().if((valor) => valor !== "")
    .isURL({ protocols: ["http", "https"], require_protocol: true }),
], validarCampos, controller.crear);
// Los ids se validan antes de consultar MongoDB en cualquiera de las rutas siguientes.
router.use("/:id", param("id").isMongoId(), validarCampos);
// GET /api/gremios/:id — consulta miembros y datos del gremio.
router.get("/:id", controller.obtener);
// POST /api/gremios/:id/miembros — incorpora al usuario autenticado.
router.post("/:id/miembros", body("codigo").optional().isString(), validarCampos, controller.unirse);
// PATCH /api/gremios/:id/miembros/:usuarioId/rol — asigna Aprendiz o sénior.
router.patch("/:id/miembros/:usuarioId/rol", [param("usuarioId").isMongoId(), body("rol").isIn(["Aprendiz", "Alquimista sénior"])], validarCampos, controller.cambiarRol);
// PUT /api/gremios/:id/catador — nombra al único Catador Oficial.
router.put("/:id/catador", body("usuarioId").isMongoId(), validarCampos, controller.nombrarCatador);
// DELETE /api/gremios/:id/miembros/:usuarioId — salida propia o expulsión autorizada.
router.delete("/:id/miembros/:usuarioId", param("usuarioId").isMongoId(), validarCampos, controller.retirarMiembro);
module.exports = router;
