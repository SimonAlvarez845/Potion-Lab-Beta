const express = require("express");

// Crea el router
const router = express.Router();

/* F(X)'S DE VALIDACION:
  body indica que datos envío la peticion HTTP.
  params indica sobre que recurso trabajo la peticion HTTP.
  query indica que filtros u opciones aplico la peticion HTTP.

  body(): valida los datos de req.body. Usualmente en POST, PUT y PATCH.
  param(): valida los datos de la URL (req.params). Usualmente en GET, PATCH, DELETE.
  query(): valida los filtros de la URL (req.query). Usualmente en GET.
*/
const { body, param, query } = require("express-validator");

const autenticar = require("../middleware/autenticar");
const validarCampos = require("../middleware/validarCampos");
const controller = require("../controllers/formulaControllers");
const votacion = require("../controllers/votacionControllers");

// Todas las rutas de fórmulas requieren un JWT.
router.use(autenticar);

/* TABLA DE VALIDACIONES:
  .trim(): elimina espacios al principio y final.
  .bail(): detiene la validación del campo si una validación anterior falla.
  .isEmail(): utiliza la validación de correo incluida en la librería.
  .toLowerCase(): uniformiza mayúsculas en minúsculas sin eliminar la estructura del correo.
  .isObject({ strict: true }): necesito que lo que me llegue sea un objeto.
  .withMessage(): personaliza el mensaje de error de la validación.
  .optional(): campo no obligatorio, pero si lo mandas tiene que cumplir las demás reglas.
  .isString(): lo que sea que mandes debe ser texto.
  .isLength(): permite definir el tamaño que debe tener el texto.
  .isIn(_): el valor debe estar dentro de _.
  .isURL(...): el formato de la URL del avatar proporcionado debe ser aceptable.
  .notEmpty(): el campo no puede estar vacío.
  .if(): aplica una validacion/es si se cumple una condición.
  .isMongoId(): comprueba que el id tenga el formato de MongoDB.
  .isInt(): comprueba que el valor sea un entero dentro del rango permitido.
  .toInt(): convierte el valor validado en un entero.
  .isISO8601(): comprueba que la fecha tenga un formato válido (este se busco)
*/

// GET /api/formulas — consulta las fórmulas y permite filtrar por gremio, estado o texto.
router.get(
  "/",
  [
    query("gremioId").optional().isMongoId(),
    query("estado")
      .optional()
      .isIn(["proposal", "voting", "closed", "distilled"]),
    query("q").optional().isString(),
  ],
  validarCampos,
  controller.listar,
);

// POST /api/formulas — valida los datos de la propuesta antes de crearla.
// El autor, el estado y las categorías los establece el servidor.
router.post(
  "/",
  [
    body("gremioId").isMongoId(),
    body("nombrePocion").isString().bail().trim().isLength({ min: 1, max: 50 }),
    body("efectoDeseado")
      .isString()
      .bail()
      .trim()
      .isLength({ min: 1, max: 200 }),
    body("dificultad").isInt({ min: 1, max: 4 }).toInt(),
    body("fechaCierre").isISO8601(),
  ],
  validarCampos,
  controller.crear,
);

// Capa de seguridad: validamos el id antes de consultar una fórmula en MongoDB.
router.use("/:id", param("id").isMongoId(), validarCampos);

// GET /api/formulas/:id — consulta una fórmula y su historial.
router.get("/:id", controller.obtener);

// POST /api/formulas/:id/abrir — abre la votación de una propuesta.
router.post("/:id/abrir", controller.abrir);

// PUT /api/formulas/:id/voto — registra o reemplaza el voto del usuario en una categoría.
router.put(
  "/:id/voto",
  [
    body("categoriaId").isString().notEmpty(),
    body("opcionId").isString().notEmpty(),
  ],
  validarCampos,
  votacion.votar,
);

// POST /api/formulas/:id/veto — consume el unico veto del Catador.
router.post(
  "/:id/veto",
  [
    body("categoriaId").isString().notEmpty(),
    body("opcionId").isString().notEmpty(),
  ],
  validarCampos,
  votacion.vetar,
);

// POST /api/formulas/:id/cerrar — cierra la votación y guarda los desempates.
router.post("/:id/cerrar", votacion.cerrar);

module.exports = router;
