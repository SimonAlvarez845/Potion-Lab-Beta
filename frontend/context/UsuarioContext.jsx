import { createContext } from "react";

// Este contexto simple comparte el usuario y las funciones de sesión y perfil. Aca solo se inicializa y sus valores se ingresan en App.jsx. Luego, los componentes pueden pedir lo que necesitan, esto con el fin de evitar prop drilling.

// Ej) En versiones iniciales cerrarSesion iba de App a LayoutPrincipal y de LayoutPrincipal a BarraSuperior. Ahora BarraSuperior la obtiene el prop directamente desde UsuarioContext.

const UsuarioContext = createContext(null);

export default UsuarioContext;
