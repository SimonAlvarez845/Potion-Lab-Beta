// Componente reutilizable para mostrar un indicador o stat pequeña

// Si no se manda ningun tono usa violeta por defecto
function TarjetaEstadistica({ icono: Icono, etiqueta, valor, detalle, tono = "violet" }) {

  // Relaciona el tono recibido con una clase CSS.
  const tonos = {
    violet: "tarjeta-estadistica-tono-violeta",
    cyan: "tarjeta-estadistica-tono-cian",
    amber: "tarjeta-estadistica-tono-ambar",
    emerald: "tarjeta-estadistica-tono-verde",
  };

  const claseTono = tonos[tono];

  return (
    <article className="tarjeta-estadistica-tarjeta-etiqueta-valor">
      <div className="tarjeta-estadistica-contenedor-flexible-etiqueta-valor">
        <div>
          <p className="tarjeta-estadistica-descripcion-etiqueta">
            {etiqueta}
          </p>
          <strong className="tarjeta-estadistica-dato-destacado-valor">
            {valor}
          </strong>
          {/* El detalle es opcional. */}
          {detalle && <p className="tarjeta-estadistica-descripcion-detalle">{detalle}</p>}
        </div>
          <span className={`tarjeta-estadistica-insignia-icono ${claseTono}`}>
          <Icono className="tarjeta-estadistica-icono-decorativo" 
          />
        </span>
      </div>
    </article>
  );
}

export default TarjetaEstadistica;
