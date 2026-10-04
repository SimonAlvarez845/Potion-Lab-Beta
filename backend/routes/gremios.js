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
const controller = require("../controllers/gremioControllers");

// Todas las rutas de gremios requieren un JWT.
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

// GET /api/gremios — obtiene todos los gremios o los del usuario, permitiendo filtrar por nombre o lema.
router.get(
  "/",
  [
    query("q").optional().isString(),
    query("mios").optional().isIn(["true", "false"]),
  ],
  validarCampos,
  controller.listar,
);

// POST /api/gremios — valida los datos del nuevo gremio
// y lo crea con el usuario autenticado como Gran Maestre.
router.post(
  "/",
  [
    body("nombre").isString().bail().trim().isLength({ min: 1, max: 50 }),
    body("lema").isString().bail().trim().isLength({ min: 1, max: 90 }),
    body("descripcion")
      .optional()
      .isString()
      .bail()
      .trim()
      .isLength({ max: 500 }),
    body("tipo").optional().isIn(["publico", "privado"]),
    body("emblemaUrl")
      .optional()
      .isString()
      .bail()
      .trim()
      .if((valor) => valor !== "")
      // Permitimos que el usuario cree un gremio sin ponerle imagen.
      .isURL({ protocols: ["http", "https"], require_protocol: true }),
  ],
  validarCampos,
  controller.crear,
);

// Capa de seguridad: Los ids se validan antes de consultar MongoDB en las siguientes rutas.
router.use("/:id", param("id").isMongoId(), validarCampos);

// GET /api/gremios/:id — consulta miembros y datos del gremio.
router.get("/:id", controller.obtener);

// POST /api/gremios/:id/miembros —  permite unirse a un gremio comprobando el código de invitación en caso de ser privado.
router.post(
  "/:id/miembros",
  body("codigo").optional().isString(),
  validarCampos,
  controller.unirse,
);

// PATCH /api/gremios/:id/miembros/:usuarioId/rol — cambia el rol de un miembro a Aprendiz/ Alquimista sénior.
router.patch(
  "/:id/miembros/:usuarioId/rol",
  [
    param("usuarioId").isMongoId(),
    body("rol").isIn(["Aprendiz", "Alquimista sénior"]),
  ],
  validarCampos,
  controller.cambiarRol,
);

// PUT /api/gremios/:id/catador — nombra al Catador oficial del gremio.
router.put(
  "/:id/catador",
  body("usuarioId").isMongoId(),
  validarCampos,
  controller.nombrarCatador,
);

// DELETE /api/gremios/:id/miembros/:usuarioId — permite salida propia o expulsión autorizada.
router.delete(
  "/:id/miembros/:usuarioId",
  param("usuarioId").isMongoId(),
  validarCampos,
  controller.retirarMiembro,
);
module.exports = router;
