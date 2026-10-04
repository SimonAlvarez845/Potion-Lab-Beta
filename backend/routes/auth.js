const express = require("express");

/* F(X)'S DE VALIDACION:
  body indica que datos envío la peticion HTTP.
  body(): valida los datos de req.body. Usualmente en POST, PUT y PATCH.
*/
const { body } = require("express-validator");

const { register, login } = require("../controllers/authControllers");
const validarCampos = require("../middleware/validarCampos");
const { ESPECIALIDADES } = require("../config/catalogo");

// Crea el router
const router = express.Router();

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

// Reglas que deben cumplir los datos enviados al registrar un usuario.
const validarRegistro = [
  body().isObject({ strict: true }).withMessage("Envía un objeto JSON"),

  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("nombreCompleto")
    .optional()
    .isString()
    .withMessage("El nombre completo debe ser texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre completo debe tener entre 2 y 50 caracteres"),

  body()
    .custom((datos) => Boolean(datos?.nombre || datos?.nombreCompleto))
    .withMessage("El nombre es obligatorio: usa nombre o nombreCompleto"),

  body("email")
    .isString()
    .withMessage("El email debe ser texto")
    .bail()
    .trim()
    .isEmail()
    .withMessage("El email no es valido")
    .toLowerCase(),

  body("password")
    .isString()
    .withMessage("La contraseña debe ser texto")
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener minimo 6 caracteres"),

  body("especialidad")
    .optional()
    .isString()
    .withMessage("La especialidad debe ser texto")
    .bail()
    .isIn(ESPECIALIDADES)
    .withMessage("Especialidad no válida"),

  body("avatarUrl")
    .optional()
    .isString()
    .withMessage("El avatar debe ser una URL en texto")
    .bail()
    .trim()
    .if((valor) => valor !== "")
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("El avatar debe ser una URL HTTP o HTTPS valida"),
];

// Reglas que deben cumplir los datos enviados al iniciar sesión.
const validarLogin = [
  body().isObject({ strict: true }).withMessage("Envía un objeto JSON"),

  body("email")
    .isString()
    .withMessage("El email debe ser texto")
    .bail()
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .toLowerCase(),

  body("password")
    .isString()
    .withMessage("La contraseña debe ser texto")
    .bail()
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

// POST /register — crea una cuenta y devuelve el usuario con su JWT
router.post("/register", validarRegistro, validarCampos, register);

// POST /login — verifica las credenciales y devuelve el usuario con su JWT
router.post("/login", validarLogin, validarCampos, login);

module.exports = router;
