import { Outlet } from "react-router-dom";
import FondoAlquimico from "../common/FondoAlquimico";
import BarraLateral from "./BarraLateral";
import BarraSuperior from "./BarraSuperior";

// Es literalmente el home de la App (siempre y cuando exista un usuario)
// y contiene todo lo que debe permanecer visible mientras el usuario navega
function LayoutPrincipal({ onLogout }) {
  return (
    <div className="layout-principal-aplicacion">
      <FondoAlquimico />
      <BarraLateral />
      <div className="layout-principal-contenido-con-barra">
        <BarraSuperior onLogout={onLogout} />
        <main className="layout-principal-pantalla">
          {/* Es un espacio reservado donde React Router va a renderizar el <main> de la pagina correspondiente a la ruta */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutPrincipal;
