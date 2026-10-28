// Registramos los eventos que manejará Socket.IO.
function registrarSockets(io) {
  // Se ejecuta cuando un cliente establece conexión.
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Se ejecuta cuando el cliente se desconecta.
    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
}

module.exports = registrarSockets;
