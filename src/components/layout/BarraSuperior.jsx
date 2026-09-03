import { useContext } from "react";
import { Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import UsuarioContext from "../../context/UsuarioContext";


function BarraSuperior({ onLogout }) {

  // Para obtener los datos del usuario compartidos por UsuarioContext.
  const usuario = useContext(UsuarioContext);

  return (
    <header className="barra-superior-encabezado-potion-lab-laboratorio-conectado">
      <div className="barra-superior-contenedor-flexible-potion-lab-laboratorio-conectado">
        <Link className="barra-superior-enlace-potion-lab" to="/">
          <strong className="barra-superior-dato-destacado-potion-lab">Potion Lab</strong>
        </Link>

        <div className="barra-superior-contenedor-flexible-bell-nombre-completo-especialidad">
          
        {/* Para que el usuario pueda acceder en todo momento a su perfil o cerrar sesion . */}
          <Link className="barra-superior-enlace-perfil" to="/perfil">
            <span className="barra-superior-insignia-iniciales">
              {usuario.nombreCompleto.charAt(0)}
            </span>
            <span className="barra-superior-texto-nombre-completo-especialidad">
              <strong className="barra-superior-dato-destacado-nombre-completo">{usuario.nombreCompleto}</strong>
              <small className="barra-superior-detalle-especialidad">{usuario.especialidad}</small>
            </span>
          </Link>

          {/* Ejecuta la funcion en App.jsx que BarraSuperior recibe para cerrar la sesion */}
          <button
            className="barra-superior-boton-cerrar-sesion"
            onClick={onLogout} 
            title="Cerrar sesión"
            type="button"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </header>
  );
}

export default BarraSuperior;
