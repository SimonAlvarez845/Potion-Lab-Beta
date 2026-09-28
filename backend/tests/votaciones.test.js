const { test } = require("node:test");
const assert = require("node:assert/strict");
const Formula = require("../models/formula");
const Gremio = require("../models/gremio");
const reglas = require("../services/resultadosService");
const servicio = require("../services/votacionService");
const ids = [1, 2, 3, 4].map((n) => String(n).padStart(24, "0"));

// No hay mocks aquí: comprobamos combinaciones del algoritmo real de pesos.
test("Especialidad y cargo se combinan; Maestro cervecero aplica a las tres categorías", () => {
  assert.equal(reglas.obtenerPesoVoto({ especialidad: "Herbalista" }, "ingrediente", false), 1.2);
  assert.equal(reglas.obtenerPesoVoto({ especialidad: "Herbalista" }, "frasco", false), 1);
  assert.equal(reglas.obtenerPesoVoto({ especialidad: "Catador" }, "frasco", true), 2.4);
  assert.equal(reglas.obtenerPesoVoto({ especialidad: "Catador" }, "metodo", true), 2);
  for (const categoria of ["ingrediente", "metodo", "frasco"]) {
    assert.equal(reglas.obtenerPesoVoto({ especialidad: "Maestro cervecero" }, categoria, true), 2.4);
  }
});

// Un veto excluye de los porcentajes y de los ganadores, pero conserva el total histórico.
test("Veto excluye opción y denominador; décimas evitan falsos desempates", () => {
  const formula = new Formula({ votos: [
    { usuarioId: ids[0], categoriaId: "ingrediente", opcionId: "mandragora", peso: 1.2 },
    { usuarioId: ids[1], categoriaId: "ingrediente", opcionId: "mandragora", peso: 1.2 },
    { usuarioId: ids[2], categoriaId: "ingrediente", opcionId: "polvo-estelar", peso: 2.4 },
  ] });
  const categoria = formula.categorias[0];
  assert.deepEqual(reglas.calcularResultados(categoria, formula.votos, null).map((o) => o.porcentaje), [50, 50]);
  const veto = { categoriaId: "ingrediente", opcionId: "mandragora" };
  const resultados = reglas.calcularResultados(categoria, formula.votos, veto);
  assert.deepEqual(resultados.map((o) => o.porcentaje), [0, 100]);
  assert.equal(resultados[0].totalVotos, 2.4);
  formula.veto = veto;
  assert.equal(reglas.calcularGanadores(formula, { miembros: [] })[0].opcion.id, "polvo-estelar");
});

// Controlamos solamente Math.random para verificar la última salida del empate.
test("Desempates: Catador, luego GM y finalmente azar congelable", (t) => {
  const formula = new Formula({ votos: [
    { usuarioId: ids[0], categoriaId: "ingrediente", opcionId: "mandragora", peso: 1 },
    { usuarioId: ids[1], categoriaId: "ingrediente", opcionId: "polvo-estelar", peso: 1 },
  ] });
  const gremio = { miembros: [{ usuarioId: ids[0], rol: "Gran Maestre" }, { usuarioId: ids[1], rol: "Catador oficial" }] };
  assert.equal(reglas.calcularGanadores(formula, gremio)[0].metodo, "voto del Catador Oficial");
  gremio.miembros.pop();
  assert.equal(reglas.calcularGanadores(formula, gremio)[0].metodo, "decisión del Gran Maestre");
  t.mock.method(Math, "random", () => 0.99);
  const ganador = reglas.calcularGanadores(formula, { miembros: [] })[0];
  assert.equal(ganador.metodo, "selección aleatoria");
  assert.equal(ganador.opcion.id, "polvo-estelar");
});

// Simulamos solo MongoDB para comprobar reemplazo, permisos, veto único y conflicto de escritura.
test("Voto reemplazable, veto único, visitante rechazado y cierre protegido", async (t) => {
  const gremio = new Gremio({ miembros: [{ usuarioId: ids[0], rol: "Gran Maestre" }, { usuarioId: ids[1], rol: "Catador oficial" }] });
  const formula = new Formula({ gremioId: gremio._id, creadaPorId: ids[0], estado: "voting", fechaCierre: new Date(Date.now() + 3600000) });
  t.mock.method(Gremio, "findById", async () => gremio);
  t.mock.method(Formula, "findById", async () => formula);
  const guardar = t.mock.method(Formula, "findOneAndUpdate", async () => formula);
  t.mock.method(formula, "save", async () => formula);
  const catador = { _id: ids[1], nombre: "Demo", especialidad: "Herbalista" };
  const datos = { categoriaId: "ingrediente", opcionId: "mandragora" };
  await assert.rejects(servicio.votar(formula.id, { _id: ids[3] }, datos), { status: 403 });
  await servicio.votar(formula.id, catador, datos);
  await servicio.votar(formula.id, catador, { ...datos, opcionId: "polvo-estelar" });
  assert.equal(formula.votos.length, 1);
  assert.equal(formula.votos[0].peso, 2.4);
  assert.equal(formula.votos[0].opcionId, "polvo-estelar");
  await assert.rejects(servicio.vetar(formula.id, { _id: ids[0] }, datos), { status: 403 });
  await servicio.vetar(formula.id, catador, datos);
  await assert.rejects(servicio.votar(formula.id, catador, datos), { status: 409 });
  await assert.rejects(servicio.vetar(formula.id, catador, datos), { status: 409 });
  await assert.rejects(servicio.cerrar(formula.id, catador), { status: 403 });
  guardar.mock.mockImplementation(async () => null);
  await assert.rejects(servicio.votar(formula.id, catador, { ...datos, opcionId: "polvo-estelar" }), { status: 409 });
  await servicio.cerrar(formula.id, { _id: ids[0] });
  assert.equal(formula.estado, "closed");
  assert.equal(formula.ganadores.length, 3);
  await assert.rejects(servicio.votar(formula.id, catador, datos), { status: 409 });
});
