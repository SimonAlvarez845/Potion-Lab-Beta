import { NavLink } from "react-router-dom";
import enlacesNavegacion from "./enlacesNavegacion";

// Al estar en movil desaparece la barra lateral y no queda navegacion por lo cual se creo un componente que representase una barra inferior movil reutilizando el layout de la barra lateral. Se usa en LayoutPrincipal.jsx
function NavegacionMovil() {
  return (
    <nav className="navegacion-movil" aria-label="Navegación principal móvil">
      {/* Reutilizamos las rutas de enlacesNavegacion.jsx y creamos un NavLink para cada una. Segun si el usuario esta activo le decimos que css usar. La idea es reutilizar las clases que ya se tenian en la barra lateral y adaptarlos para no duplicar estilos. */}
      {enlacesNavegacion.map(({ to, etiqueta, icono: Icono, exacto }) => (
        <NavLink
          className={({ isActive }) =>
            `barra-lateral-enlace-opcion navegacion-movil-enlace ${
              isActive
                ? "barra-lateral-enlace-activo"
                : "barra-lateral-enlace-inactivo"
            }`
          }
          end={exacto}
          key={to}
          to={to}
        >
          <Icono className="barra-lateral-icono-decorativo" />
          {etiqueta}
        </NavLink>
      ))}
    </nav>
  );
}

export default NavegacionMovil;
