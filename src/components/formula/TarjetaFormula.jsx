import { Link } from "react-router-dom";
import InsigniaEstado from "../common/InsigniaEstado";

// Recibe todos los resultados relacionados a las formulas y los muestra de forma bonita
// Se llama en FormulasPage.jsx y ResumenPage.jsx

function TarjetaFormula({ formula, gremio, creador, votosCompletados = 0 }) {
  return (
    <article className="tarjeta-formula-tarjeta-layers-nivel-dificultad-nombre">
      <InsigniaEstado estado={formula.estado} />
      <div className="tarjeta-formula-contenedor-flexible-nombre-pocion-efecto-deseado">
        <p className="tarjeta-formula-descripcion">{gremio?.nombre ?? "Sin gremio"}</p>
        <h2 className="tarjeta-formula-titulo-seccion-nombre-pocion">{formula.nombrePocion}</h2>
        <p className="tarjeta-formula-descripcion-efecto-deseado">{formula.efectoDeseado}</p>
      </div>
      <p className="tarjeta-formula-texto-user">
        Autor: {creador?.nombreCompleto ?? "Desconocido"}
      </p>
      <p className="tarjeta-formula-contenedor-tu-participacion-votos-completados">
        Tus votos: {votosCompletados}/3
      </p>
      <Link className="tarjeta-formula-enlace-formulas" to={`/formulas/${formula.id}`}>
        Ver fórmula
      </Link>
    </article>
  );
}

export default TarjetaFormula;
