const express = require("express");

// f(x) Body: API diseñada para validar exclusivamente el cuerpo de la petición HTTP (req.body)
const { body } = require("express-validator");

// Importamos el register de controllers
const { register } = require("../controllers/authControllers");
const validarCampos = require("../middleware/validarCampos");

const router = express.Router();

/** Algunas validaciones
  .trim(): elimina espacios al principio y final
  .notEmpty(): comprueba que el campo tenga contenido
  .bail(): si auth falla deja de evaluar ese campo 
  pq) un correo vacio no debe generar el mensaje "email no valido"
  .isEmail(): utiliza validacion correo incluida en la lib
  .normalizeEmail(): lit uniformiza el correo (lowercase y quita el subadress)
  pq) sirve para validación, comparación y prevención de cuentas duplicadas
*/

// contiene las reglas para el usuario
const validarRegistro = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .bail()
    .isEmail()
    .withMessage("El email no es valido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener minimo 6 caracteres"),
];

// Le pasamos absolutamente todo lo relacionado al registro al post
router.post("/register", validarRegistro, validarCampos, register);

module.exports = router;
