import { createContext } from "react";

// Este contexto simple comparte el usuario que inició sesión con el resto de la App.
const UsuarioContext = createContext(null);

export default UsuarioContext;