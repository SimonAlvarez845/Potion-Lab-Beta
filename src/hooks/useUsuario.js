import { useContext } from "react";
import UsuarioContext from "../context/UsuarioContext";

// Un pequeño hook propio que nos facilita el acceso al Context de Usuario para no tener que escribir tanto. 

export default function useUsuario() {
  return useContext(UsuarioContext);
}
