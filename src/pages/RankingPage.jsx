import EncabezadoPagina from "../components/common/EncabezadoPagina";

function RankingPage({ usuarios, usuarioActivo }) {
  const ranking = [...usuarios].sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="ranking-lista-vertical-map-clasificacion-completa-alquimistas">
      <EncabezadoPagina
        descripcion="Clasificación por puntos y participación."
        etiqueta="Temporada actual"
        titulo="Ranking alquímico"
      />

      <section className="ranking-seccion-clasificacion-completa-alquimistas-destacados">
        <h2 className="ranking-titulo-seccion-alquimistas-destacados">
          {" "}
          Alquimistas
        </h2>
        <div className="ranking-contenedor-posicion-alquimista-puntos-rareza">
          <table className="ranking-tabla-posicion-alquimista-puntos-rareza">
            <thead>
              <tr className="ranking-fila-tabla-posicion-alquimista-puntos-rareza">
                <th className="ranking-titulo-columna-posicion">Posición</th>
                <th className="ranking-titulo-columna-alquimista">
                  Alquimista
                </th>
                <th className="ranking-titulo-columna-puntos">Puntos</th>
                <th className="ranking-titulo-columna-rareza">Rareza</th>
                <th className="ranking-titulo-columna-precision">Precisión</th>
                <th className="ranking-titulo-columna-participacion">
                  Participación
                </th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((usuario, indice) => (
                <tr
                  className={
                    usuario.id === usuarioActivo.id
                      ? "ranking-fila-usuario-activo"
                      : ""
                  }
                  key={usuario.id}
                >
                  <td className="ranking-celda-posicion">#{indice + 1}</td>
                  <td className="ranking-celda-iniciales-nombre-completo-especialidad">
                    <strong className="ranking-dato-destacado-nombre-completo">
                      {usuario.nombreCompleto}{" "}
                      {usuario.id === usuarioActivo.id && "(Tú)"}
                    </strong>
                    <small className="ranking-detalle-especialidad">
                      {usuario.especialidad}
                    </small>
                  </td>
                  <td className="ranking-celda-puntos">{usuario.puntos}</td>
                  <td className="ranking-celda-rareza-total">
                    {usuario.rarezaTotal}
                  </td>
                  <td className="ranking-celda-target-precision-catador">
                    {usuario.precisionCatador}%
                  </td>
                  <td className="ranking-celda-participacion">
                    {usuario.participacion}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="ranking-descripcion-alert-triangle-quien-tenga">
        Menos de 30% de participación bloquea nuevas propuestas durante 7 días.
      </p>
    </div>
  );
}

export default RankingPage;
