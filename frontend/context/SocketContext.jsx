import { createContext, useEffect, useState } from "react";
import { socket } from "../services/socket";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnected() {
      setConnected(true);
    }

    function onDisconnected() {
      setConnected(false);
    }

    socket.on("connect", onConnected);
    socket.on("disconnect", onDisconnected);

    socket.connect();

    // Limpiar listeners para evitar duplicados
    return () => {
      socket.off("connect", onConnected);
      socket.off("disconnect", onDisconnected);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
