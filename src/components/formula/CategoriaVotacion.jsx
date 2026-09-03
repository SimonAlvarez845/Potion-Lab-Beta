import { calcularResultados } from "../../utils/voting";

// AQUI VOY
function CategoriaVotacion({
  categoria,
  opcionSeleccionada,
  pesoVoto,
  veto,
  puedeVotar,
  puedeVetar,
  onVote,
  onVeto,
}) {
  const resultados = calcularResultados(
    categoria,
    opcionSeleccionada,
    pesoVoto,
    veto,
  );

  return (
    <fieldset className="categoria-votacion-elemento-fieldset-nombre-descripcion-peso-de">
      <legend className="categoria-votacion-elemento-legend-nombre-descripcion-peso-de">
        <strong className="categoria-votacion-dato-destacado-nombre">
          {categoria.nombre}
        </strong>
        <small className="categoria-votacion-detalle-descripcion">
          {categoria.descripcion}
        </small>
      </legend>
      <p className="categoria-votacion-texto-peso-de-tu-voto">
        Peso de tu voto: {pesoVoto.toFixed(1)}×
      </p>

      <div className="categoria-votacion-cuadricula-map">
        {resultados.map((opcion) => {
          const seleccionada = opcion.id === opcionSeleccionada;
          const claseEstado = opcion.vetada
            ? "categoria-votacion-opcion-vetada"
            : seleccionada
              ? "categoria-votacion-opcion-seleccionada"
              : "categoria-votacion-opcion-disponible";

          return (
            <article
              className={`categoria-votacion-tarjeta-opcion ${claseEstado}`}
              key={opcion.id}
            >
              <button
                className="categoria-votacion-boton-sigla-nombre-opcion-vetada"
                disabled={!puedeVotar || opcion.vetada}
                onClick={() => onVote(categoria.id, opcion.id)}
                type="button"
              >
                <strong className="categoria-votacion-nombre-opcion">
                  {opcion.nombre}
                </strong>
                <span className="categoria-votacion-detalle-opcion-vetada">
                  {opcion.vetada
                    ? "Vetada"
                    : seleccionada
                      ? "Tu voto"
                      : "Votar"}
                </span>
              </button>

              <p className="categoria-votacion-texto-to-fixed-votos-ponderados">
                {opcion.totalVotos.toFixed(1)} votos · {opcion.porcentaje}%
              </p>

              {puedeVetar && !veto && !opcion.vetada && (
                <button
                  className="categoria-votacion-boton-shield-aplicar-veto-de"
                  onClick={() => onVeto(categoria.id, opcion.id)}
                  type="button"
                >
                  Vetar opción
                </button>
              )}
            </article>
          );
        })}
      </div>
    </fieldset>
  );
}

export default CategoriaVotacion;
