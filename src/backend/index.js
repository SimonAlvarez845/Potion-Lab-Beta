const express = require("express");
const app = express();
app.use(express.json());


// aqui va la base de datos (mockup)

// mandamos los gets y posts

const PORT = 3000;

// app listen(Port, () => console.log( server corriendo))

// ambiende de desarollo, de pruebas y de produccion

// start es producion, dev es desarollo y test es pruebas.

// vamos aca a pegar una base de datos usando MongoDB

// Bcrypt para encriptar contraseñas mediante hashes y Render para generar JWT para el deploy