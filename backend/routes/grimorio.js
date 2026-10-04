const express = require("express");
const { query } = require("express-validator");
const autenticar = require("../middleware/autenticar");
const actualizarPlazos = require("../middleware/actualizarPlazos");
const validarCampos = require("../middleware/validarCampos");
const controller = require("../controllers/destilacionControllers");

const router = express.Router();
router.use(autenticar, actualizarPlazos);
router.get(
  "/",
  [query("gremioId").optional().isMongoId(), query("q").optional().isString()],
  validarCampos,
  controller.listar,
);

module.exports = router;
