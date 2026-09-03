import { Link } from "react-router-dom";

function TarjetaGremio({ gremio, usuarioId, onJoin }) {
  const pertenece = gremio.miembros.some((miembro) => miembro.usuarioId === usuarioId);

  return (
    <article className="tarjeta-gremio-tarjeta-publico-nombre-lema">
      <div className="tarjeta-gremio-franja-color" style={{ background: gremio.acento }} />
      <div className="tarjeta-gremio-contenedor-flexible-publico-nombre-lema">
        <p className="tarjeta-gremio-texto-publico">
          Gremio {gremio.tipo === "publico" ? "público" : "privado"}
        </p>
        <div className="tarjeta-gremio-contenedor-flexible-nombre-lema">
          <h2 className="tarjeta-gremio-titulo-seccion-nombre">{gremio.nombre}</h2>
          <p className="tarjeta-gremio-descripcion-lema">“{gremio.lema}”</p>
          <p className="tarjeta-gremio-descripcion">{gremio.descripcion}</p>
        </div>
        <p className="tarjeta-gremio-texto-users-length-miembros">
          {gremio.miembros.length} miembros
        </p>
        {pertenece ? (
          <Link className="tarjeta-gremio-enlace-gremios" to={`/gremios/${gremio.id}`}>
            Ver gremio
          </Link>
        ) : (
          <button
            className="tarjeta-gremio-boton-unirme-al-gremio"
            onClick={() => onJoin(gremio)}
            type="button"
          >
            {gremio.tipo === "publico" ? "Unirme al gremio" : "Ingresar código"}
          </button>
        )}
      </div>
    </article>
  );
}

export default TarjetaGremio;
