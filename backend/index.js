// Buscamos un archivo .env y cargamos sus variables dentro de process.env.
require("dotenv").config();

// Express construye el servidor y nos permite crear rutas.
const express = require("express");

// CORS permite que React y Express se comuniquen.
const cors = require("cors");

// Conectamos el servidor con nuestra base de datos.
const conectarBaseDatos = require("./config/database");

// Cargamos las rutas de autenticación, gestión de perfil de usuario y gremios
const authRoutes = require("./routes/auth");
const usuarioRoutes = require("./routes/usuarios");
const gremioRoutes = require("./routes/gremios");
const formulaRoutes = require("./routes/formulas");

// Convierte los errores del backend en respuestas JSON entendibles.
const manejarErrores = require("./middleware/manejarErrores");

// Este "app" representa nuestro servidor.
const app = express();

// Si existe un puerto en process.env lo usamos. Si no existe, usamos el 3000.
const PORT = process.env.PORT || 3000;

// Permitimos peticiones desde otros puntos como nuestro frontend de React.
app.use(cors());

// Convertimos el JSON recibido en un objeto de JavaScript.
app.use(express.json());

// Ruta de prueba para comprobar que la API esté funcionando.
app.get("/api/salud", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Potion Lab API funcionando",
  });
});

// Toda ruta de cada seccion debe comenzar como la de su respectivo Ej)

// Todas las rutas de autenticación
// Ej: /api/auth/register o /api/auth/login.
app.use("/api/auth", authRoutes);

// Rutas del perfil
// Ej: /api/usuarios/me.
app.use("/api/usuarios", usuarioRoutes);

// Rutas para crear, consultar y administrar gremios.
// Ej: /api/gremios/:id.
app.use("/api/gremios", gremioRoutes);

// Propuestas alquímicas y sus operaciones de votación.
app.use("/api/formulas", formulaRoutes);

// Va después de las rutas para capturar y responder a los errores que lleguen hasta este punto.
app.use(manejarErrores);

const iniciarServidor = async () => {
  // Verificamos que exista la clave necesaria para crear los JWT.
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no está configurado");
  }
  // Primero intentamos conectarnos a MongoDB.
  await conectarBaseDatos();

  // listen solo se ejecuta cuando la conexion funciona.
  // Así evitamos tener una API encendida sin DB.
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

// El if: solo iniciamos el servidor si este index fue ejecutado directamente.
// Si un test importa "app", evitamos encender el servidor automáticamente.
if (require.main === module) {
  iniciarServidor().catch((error) => {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exitCode = 1;
  });
}

// Exportamos la app para poder reutilizarla desde futuros tests.
module.exports = app;
