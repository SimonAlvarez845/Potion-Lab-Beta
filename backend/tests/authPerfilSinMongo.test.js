// Desde terminal de backend: node --test tests/authPerfilSinMongo.test.js

// Pruebas desarrolladas con apoyo de IA para verificar los casos criticos de autenticación y perfil y saber se desarollo correctamente esta parte del backend

const { test } = require("node:test");
const assert = require("node:assert/strict");

const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const autenticar = require("../middleware/autenticar");

const {
  presentarUsuario,
  actualizarPerfil,
} = require("../services/usuarioService");

// Test 1: Comprobar que no se exponga info sensible en los filtros
test("La respuesta conserva el contrato y excluye contraseña y campos internos", () => {
  const usuario = new Usuario({
    nombre: "Aprendiz",
    email: "aprendiz@potionlab.test",
    password: "secreto",
  });
  const respuesta = presentarUsuario(usuario);

  assert.equal(respuesta.id, usuario.id);
  assert.equal(respuesta.nombreCompleto, respuesta.nombre);
  assert.equal(respuesta.especialidad, "Herbalista");
  assert.equal(respuesta.password, undefined);
  assert.equal(respuesta._id, undefined);
  assert.equal(respuesta.__v, undefined);
  assert.equal(usuario.toJSON().password, undefined);
});

// Test 2: Comprobar la autenticacion mediante los JWT
test("JWT válido autentica; ausente, alterado, vencido o sin usuario se rechazan", async (t) => {
  const secretoAnterior = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "clave-local-exclusiva-de-pruebas";
  t.after(() => {
    if (secretoAnterior === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secretoAnterior;
  });
  const usuario = { id: "000000000000000000000001" };
  t.mock.method(Usuario, "findById", async (id) =>
    id === usuario.id ? usuario : null,
  );
  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const req = { get: () => `Bearer ${token}` };
  let continuo = false;
  await autenticar(req, {}, () => {
    continuo = true;
  });
  assert.equal(req.usuario, usuario);
  assert.equal(continuo, true);

  const vencido = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: -1,
  });
  const sinUsuario = jwt.sign(
    { id: "000000000000000000000002" },
    process.env.JWT_SECRET,
  );
  for (const cabecera of [
    undefined,
    `Bearer ${token}alterado`,
    `Bearer ${vencido}`,
    `Bearer ${sinUsuario}`,
  ]) {
    await assert.rejects(
      autenticar({ get: () => cabecera }, {}, () =>
        assert.fail("No debe continuar"),
      ),
      { status: 401 },
    );
  }
});

// Test 3: Impedir que el usuario modifique los cambios protegidos
test("Campos protegidos rechazan toda la edición antes de modificar o guardar", async () => {
  const usuario = {
    nombre: "Original",
    role: "user",
    save: async () => assert.fail("No debe guardar campos protegidos"),
  };
  for (const datos of [
    { nombre: "No guardar", role: "admin" },
    { nombre: "No guardar", puntos: 999 },
    { nombre: "No guardar", password: "OtraClave" },
    { nombre: "No guardar", id: "otro-usuario" },
  ]) {
    await assert.rejects(actualizarPerfil(usuario, datos), { status: 400 });
    assert.equal(usuario.nombre, "Original");
    assert.equal(usuario.role, "user");
  }
});
