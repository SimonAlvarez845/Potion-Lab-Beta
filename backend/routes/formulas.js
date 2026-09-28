const router = require("express").Router();
const { body, param, query } = require("express-validator");
const autenticar = require("../middleware/autenticar");
const validarCampos = require("../middleware/validarCampos");
const controller = require("../controllers/formulaControllers");
const votacion = require("../controllers/votacionControllers");
router.use(autenticar);

// GET /api/formulas — catálogo filtrable por gremio, estado y texto.
router.get("/", [query("gremioId").optional().isMongoId(), query("estado").optional().isIn(["proposal", "voting", "closed", "distilled"]), query("q").optional().isString()], validarCampos, controller.listar);
// POST /api/formulas — crea una propuesta; categorías, estado y autor los fija el servidor.
router.post("/", [
  body("gremioId").isMongoId(),
  body("nombrePocion").isString().bail().trim().isLength({ min: 1, max: 50 }),
  body("efectoDeseado").isString().bail().trim().isLength({ min: 1, max: 200 }),
  body("dificultad").isInt({ min: 1, max: 4 }).toInt(),
  body("fechaCierre").isISO8601(),
], validarCampos, controller.crear);
router.use("/:id", param("id").isMongoId(), validarCampos);
// GET /api/formulas/:id — consulta la propuesta y su historial.
router.get("/:id", controller.obtener);
// POST /api/formulas/:id/abrir — inicia la votación una sola vez.
router.post("/:id/abrir", controller.abrir);
// PUT /api/formulas/:id/voto — registra o reemplaza MI voto en una categoría.
router.put("/:id/voto", [body("categoriaId").isString().notEmpty(), body("opcionId").isString().notEmpty()], validarCampos, votacion.votar);
// POST /api/formulas/:id/veto — consume el único veto del Catador.
router.post("/:id/veto", [body("categoriaId").isString().notEmpty(), body("opcionId").isString().notEmpty()], validarCampos, votacion.vetar);
// POST /api/formulas/:id/cerrar — cierra la votación y guarda los desempates.
router.post("/:id/cerrar", votacion.cerrar);
module.exports = router;
