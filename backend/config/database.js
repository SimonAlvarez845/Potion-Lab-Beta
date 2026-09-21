// mongoose es la lib que conecta JS con Mongo
const mongoose = require("mongoose");

// Hay que esperar hasta que Atlas responda
const conectarBaseDatos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Base de datos conectada correctamente");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = conectarBaseDatos;
