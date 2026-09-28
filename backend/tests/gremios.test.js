const { test } = require("node:test");
const assert = require("node:assert/strict");
const Gremio = require("../models/gremio");
const servicio = require("../services/gremioService");
const { obtenerRol, exigirRol } = require("../utils/roles");

// Sin MongoDB: simulamos únicamente búsqueda y guardado; los permisos son los del service real.
test("El rol global no da permisos y el código solo lo ve el Gran Maestre", () => {
  const gremio = new Gremio({ creadoPorId: "000000000000000000000001", codigoInvitacion: "ABC123",
    miembros: [{ usuarioId: "000000000000000000000001", rol: "Gran Maestre" }] });
  assert.equal(obtenerRol(gremio, "000000000000000000000002"), "Visitante");
  assert.throws(() => exigirRol(gremio, "000000000000000000000002", ["Gran Maestre"]), { status: 403 });
  assert.equal(servicio.presentarGremio(gremio, "000000000000000000000002").codigoInvitacion, undefined);
  assert.equal(servicio.presentarGremio(gremio, "000000000000000000000001").codigoInvitacion, "ABC123");
});

// Se espera máximo tres séniores, un único Catador y protección del Gran Maestre.
test("Límite de séniores, reemplazo de Catador e ingreso privado", async (t) => {
  const ids = [1, 2, 3, 4, 5, 6].map((n) => String(n).padStart(24, "0"));
  const gremio = new Gremio({ creadoPorId: ids[0], tipo: "privado", codigoInvitacion: "ABC123",
    miembros: ids.slice(0, 5).map((usuarioId, i) => ({ usuarioId,
      rol: i === 0 ? "Gran Maestre" : i === 4 ? "Aprendiz" : "Alquimista sénior" })) });
  t.mock.method(Gremio, "findById", async () => gremio);
  t.mock.method(gremio, "save", async () => gremio);
  await assert.rejects(servicio.cambiarRol(gremio.id, ids[0], ids[4], "Alquimista sénior"), { status: 409 });
  await servicio.cambiarRol(gremio.id, ids[0], ids[1], "Catador oficial");
  await servicio.cambiarRol(gremio.id, ids[0], ids[4], "Catador oficial");
  assert.equal(obtenerRol(gremio, ids[1]), "Aprendiz");
  assert.equal(gremio.miembros.filter((m) => m.rol === "Catador oficial").length, 1);
  await assert.rejects(servicio.retirarMiembro(gremio.id, ids[0], ids[0]), { status: 403 });
  await assert.rejects(servicio.unirse(gremio.id, ids[5], "ERROR"), { status: 403 });
  await servicio.unirse(gremio.id, ids[5], " abc123 ");
  await assert.rejects(servicio.unirse(gremio.id, ids[5], "ABC123"), { status: 409 });
  await servicio.retirarMiembro(gremio.id, ids[5], ids[5]);
  assert.equal(obtenerRol(gremio, ids[5]), "Visitante");
});
