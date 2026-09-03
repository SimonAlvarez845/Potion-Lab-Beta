// Componente reutilizable usado en las busquedas. Es la cajita bonita y reutilizable de “no encontramos nada”. Lo unico raro aca es que se renombra icono como Icono dentro del componente para evitar confusiones
function EstadoVacio({ icono: Icono, titulo, descripcion, accion }) {
  return (
    <div className="estado-vacio-contenedor-flexible-titulo-descripcion">
      <span className="estado-vacio-insignia">
        <Icono/>
      </span>
      <h2 className="estado-vacio-titulo-seccion">{titulo}</h2>
      <p className="estado-vacio-descripcion">{descripcion}</p>
      {/* accion puede recibir JSX, por ejemplo un boton o un link. */}
      {accion && <div className="estado-vacio-contenedor-accion">{accion}</div>}
    </div>
  );
}

export default EstadoVacio;
