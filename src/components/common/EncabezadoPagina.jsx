// Componente reutilizable para mostrar el encabezado de las distintas paginas.

function EncabezadoPagina({ etiqueta, titulo, descripcion, acciones }) {
  return (
    <header className="encabezado-pagina-encabezado-titulo">
      <div className="encabezado-pagina-contenedor-titulo">
        {etiqueta && (
          <p className="encabezado-pagina-descripcion-etiqueta">
            {etiqueta}
          </p>
        )}
        <h1 className="encabezado-pagina-titulo-principal">
          {titulo}
        </h1>
        {descripcion && (
          <p className="encabezado-pagina-descripcion">
            {descripcion}
          </p>
        )}
      </div>
      {/* acciones puede recibir JSX, por ejemplo un boton o un link. */}
      {acciones && <div className="encabezado-pagina-contenedor-flexible-acciones">{acciones}</div>}
    </header>
  );
}

export default EncabezadoPagina;
