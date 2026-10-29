import EncabezadoPagina from "../components/common/EncabezadoPagina";
import { useEffect, useState } from "react";
import { obtenerRankingAPI } from "../services/usuarioService";

function RankingPage({ usuarioActivo }) {
  const [ranking, setRanking] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarRanking() {
      try {
        const usuarios = await obtenerRankingAPI();

        if (activo) {
          setRanking(usuarios);
        }
      } catch (error) {
        console.error("Error al cargar el ranking:", error);

        if (activo) {
          setError("No fue posible cargar el ranking.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarRanking();

    return () => {
      activo = false;
    };
  }, []);
  return (
    <div className="ranking-lista-vertical-map-clasificacion-completa-alquimistas">
      <EncabezadoPagina
        descripcion="Clasificación por puntos y participación."
        etiqueta="Temporada actual"
        titulo="Ranking alquímico"
      />

      {cargando && <p>Cargando ranking...</p>}
      {error && <p role="alert">{error}</p>}
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
                <th className="ranking-columna-perfil">Perfil</th>
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
              {!cargando &&
                !error &&
                ranking.map((usuario, indice) => (
                  <tr
                    className={
                      usuario.id === usuarioActivo.id
                        ? "ranking-fila-usuario-activo"
                        : ""
                    }
                    key={usuario.id}
                  >
                    <td className="ranking-celda-posicion">#{indice + 1}</td>
                    <td className="ranking-columna-perfil">
                      <div
                        className="ranking-avatar imagen-con-respaldo"
                        role="img"
                        aria-label={`Perfil de ${usuario.nombreCompleto}`}
                      >
                        <span aria-hidden="true">
                          {usuario.nombreCompleto.charAt(0)}
                        </span>
                        {usuario.avatarUrl && (
                          <img
                            key={usuario.avatarUrl}
                            src={usuario.avatarUrl}
                            alt=""
                            onError={(evento) => {
                              evento.currentTarget.hidden = true;
                            }}
                          />
                        )}
                      </div>
                    </td>
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
                      {Math.round(usuario.precisionCatador)}%
                    </td>
                    <td className="ranking-celda-participacion">
                      {Math.round(usuario.participacion)}%
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
