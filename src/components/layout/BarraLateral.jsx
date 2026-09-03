import { NavLink } from "react-router-dom";
import { GiPotionBall } from "react-icons/gi";
import enlacesNavegacion from "./enlacesNavegacion";

// NavLink es como Nav pero se usa en los menus de navegacion ya que tambien puede detectar si la ruta esta activa (lo usamos para aplicarle un estilo diferente segun la ruta).

function BarraLateral() {
  return (
    <aside className="barra-lateral-panel-lateral-potion-lab-academia-arcana">
      <div className="barra-lateral-contenedor-flexible-potion-lab-academia-arcana">
        <span className="barra-lateral-insignia">
          <GiPotionBall />
        </span>
        <span>
          <strong className="barra-lateral-dato-destacado-potion-lab">
            Potion Lab
          </strong>
          <small className="barra-lateral-detalle-academia-arcana">
            Academia arcana
          </small>
        </span>
      </div>

      <nav className="barra-lateral-navegacion-principal">
        <p className="barra-lateral-descripcion-laboratorio">Navegación</p>

        {/* Convertir cada objeto de enlacesNavegacion en un link de React Router. */}

        {/* Ojo: icono es mejor renombrarlo en caps porque es un componente y se puede malinterpretar como etiqueta custom de HTML. */}

        {enlacesNavegacion.map(({ to, etiqueta, icono: Icono, exacto }) => (
          <NavLink
            // Esto se hace para que pueda aplicar un estilo diferente si el link corresponde a la ruta

            // isActive es un prop de un valor booleano que pertenece a React Router y sirve para indicarle cual estado esta activo

            /*
          sin el ternario se entiende mejor lo que se busca hacer: 
          if (isActive) 
          {
            return "barra-lateral-enlace-opcion barra-lateral-enlace-activo";
          }

          return "barra-lateral-enlace-opcion barra-lateral-enlace-inactivo";
          */

            className={({ isActive }) =>
              `barra-lateral-enlace-opcion ${
                isActive
                  ? "barra-lateral-enlace-activo"
                  : "barra-lateral-enlace-inactivo"
              }`
            }
            // lo usamos para "resumen". Le dice al router: Si el link acaba en / se debe considerar activo. sin "end" resumen saldria activo en todas las demas rutas que empiecen por /
            end={exacto}
            // requisito de React al usar .map
            key={to}
            // lo mas facil es  usar "to" en caso de que ningun link se repita
            to={to}
          >
            <Icono className="barra-lateral-icono-decorativo" />
            {etiqueta}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default BarraLateral;
