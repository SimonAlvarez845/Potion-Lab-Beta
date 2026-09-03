const express = require("express");
const router = express.Router();

const { body } = require("express-validator");
const { register } = require("../controllers/authController");

const validarRegistro = [
  body("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio"),

  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio"),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

router.post("/register", validarRegistro, register);

module.exports = router;