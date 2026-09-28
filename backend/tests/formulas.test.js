const { test } = require("node:test");
const assert = require("node:assert/strict");
const Formula = require("../models/formula");
const Gremio = require("../models/gremio");
const servicio = require("../services/formulaService");

// Simulamos MongoDB, pero usamos documentos reales y los permisos del service.
test("Solo GM/sénior abre propuestas vigentes y el catálogo no viene del cliente", async (t) => {
  const id = "000000000000000000000001";
  const gremio = new Gremio({ miembros: [{ usuarioId: id, rol: "Gran Maestre" }] });
  const formula = new Formula({ gremioId: gremio._id, creadaPorId: id,
    nombrePocion: "Luz", efectoDeseado: "Iluminar", dificultad: 2, fechaCierre: new Date(Date.now() + 3600000) });
  t.mock.method(Gremio, "findById", async () => gremio);
  t.mock.method(Formula, "findById", async () => formula);
  t.mock.method(formula, "save", async () => formula);
  assert.equal(formula.categorias.length, 3);
  await assert.rejects(servicio.abrir(formula.id, { _id: "000000000000000000000002" }), { status: 403 });
  await assert.rejects(servicio.crear({ _id: id, participacion: 29 }, { gremioId: gremio.id }), { status: 403 });
  assert.throws(() => servicio.validarFechaCierre(new Date(0)), { status: 400 });
  assert.throws(() => servicio.validarFechaCierre(new Date(Date.now() + 9 * 86400000)), { status: 400 });
  const abierta = await servicio.abrir(formula.id, { _id: id, nombre: "Demo" });
  assert.equal(abierta.estado, "voting");
  await assert.rejects(servicio.abrir(formula.id, { _id: id }), { status: 409 });
});
