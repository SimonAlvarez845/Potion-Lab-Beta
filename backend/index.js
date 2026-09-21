// Buscamos un archivo .env y cargamos sus variables dentro de process.env.
require("dotenv").config();

// Express construye el servidor y nos permite crear rutas.
const express = require("express");

// CORS permite que React y Express se comuniquen.
const cors = require("cors");

// Conectamos el servidor con nuestra base de datos.
const conectarBaseDatos = require("./config/database");

// Cargamos las rutas relacionadas con registro y login.
const authRoutes = require("./routes/auth");

// Convierte los errores del backend en respuestas JSON entendibles.
const manejarErrores = require("./middleware/manejarErrores");

// Este "app" representa nuestro servidor.
const app = express();

// Si existe un puerto en process.env lo usamos. Si no existe, usamos el 3000.
const PORT = process.env.PORT || 3000;

// Permitimos recibir requests desde nuestro frontend.
app.use(cors());

// Convertimos el JSON recibido en un objeto de JavaScript.
app.use(express.json());

// Ruta de prueba para comprobar que la API esté funcionando (con Postman).
app.get("/api/salud", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Potion Lab API funcionando",
  });
});

// Todas las rutas de autenticación empiezan con /api/auth. ej) /api/auth/register
app.use("/api/auth", authRoutes);

// Va despues de las rutas para recibir cualquier error que ocurra en ellas.
app.use(manejarErrores);

const iniciarServidor = async () => {
  // Primero intentamos conectarnos a MongoDB.
  await conectarBaseDatos();

  // listen solo se ejecuta cuando la conexion funciona.
  // Así evitamos tener una API encendida sin DB.
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

// Una vez el proceso de conexión inicie correctamente se intenta encender el servidor.
iniciarServidor();
