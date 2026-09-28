// Mongoose permite conectar Node.js con MongoDB y trabajar con sus datos.
const mongoose = require("mongoose");

// Esperamos a que la conexión con MongoDB Atlas termine antes de continuar.
const conectarBaseDatos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Base de datos conectada correctamente");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);

    // Si no podemos conectarnos a MongoDB, detenemos el proceso.
    process.exit(1);
  }
};

// Exportamos para que index.js pueda iniciar la conexión.
module.exports = conectarBaseDatos;
