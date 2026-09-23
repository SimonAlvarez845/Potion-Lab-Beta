import { Link, useParams } from "react-router-dom";
import InsigniaEstado from "../components/common/InsigniaEstado";
import CategoriaVotacion from "../components/formula/CategoriaVotacion";
import { formatearFecha } from "../utils/formatters";
import { esCatadorOficial, obtenerRol } from "../utils/roles";
import { obtenerPesoVoto } from "../utils/voting";

function FormulaDetallePage({
  usuario,
  usuarios,
  gremios,
  formulas,
  votos,
  grimorio,
  auditoria,
  onVote,
  onVeto,
  onTransition,
  onDistill,
}) {
  // Obtiene el id desde el link y lo almacena
  const { formulaId } = useParams();

  // Busca y almacena la formula
  const formula = formulas.find((item) => item.id === formulaId);

  if (!formula) {
    return (
      <section className="formula-detalle-seccion-formula-no-encontrada-volver">
        <h1 className="formula-detalle-titulo-principal-formula-no-encontrada">
          Fórmula no encontrada
        </h1>
        <Link className="formula-detalle-enlace-formulas" to="/formulas">
          Volver a fórmulas
        </Link>
      </section>
    );
  }

  const gremio = gremios.find((item) => item.id === formula.gremioId);
  const creador = usuarios.find((item) => item.id === formula.creadaPorId);
  const rol = obtenerRol(gremio, usuario.id);
  const catadorOficial = esCatadorOficial(gremio, usuario.id);
  const puedeGestionar = ["Gran Maestre", "Alquimista sénior"].includes(rol);
  const puedeVotar = formula.estado === "voting" && rol !== "Visitante";
  const puedeVetar = formula.estado === "voting" && catadorOficial;

  // Todos los votos de esta formula se usan para calcular los resultados generales.
  const votosTodos = votos[formula.id] ?? {};

  // Solo los votos del usuario conectado se usan para saber que opciones y categorias eligio/completo
  const votosUsuario = votosTodos[usuario.id] ?? {};

  const pocion = grimorio.find((item) => item.formulaId === formula.id);

  // Solo quiero los eventos relacionados con esa formula ordenados de mas reciente a mas antiguo.
  const eventos = auditoria
    .filter((evento) => evento.formulaId === formula.id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="formula-detalle-lista-vertical-arrow-left-volver-a">
      <Link className="formula-detalle-enlace-volver-formulas" to="/formulas">
        Volver a fórmulas
      </Link>

      <section className="formula-detalle-seccion-nombre-pocion-efecto-deseado">
        <div className="formula-detalle-presentacion">
          <InsigniaEstado estado={formula.estado} />
          <h1 className="formula-detalle-titulo-principal-nombre-pocion">
            {formula.nombrePocion}
          </h1>
          <p className="formula-detalle-descripcion-efecto-deseado">
            {formula.efectoDeseado}
          </p>
        </div>
        <dl className="formula-detalle-ficha">
          <div>
            <dt>Gremio</dt>
            <dd>{gremio.nombre}</dd>
          </div>
          <div>
            <dt>Autor</dt>
            <dd>{creador?.nombreCompleto ?? "Desconocido"}</dd>
          </div>
          <div>
            <dt>Dificultad</dt>
            <dd>{formula.dificultad}</dd>
          </div>
          <div>
            <dt>Cierre</dt>
            <dd>{formatearFecha(formula.fechaCierre, true)}</dd>
          </div>
        </dl>

        {/* Boton para abrir la votacion con renderizado condicional */}
        <div className="formula-detalle-contenedor-flexible">
          {formula.estado === "proposal" && puedeGestionar && (
            <button
              className="formula-detalle-boton-zap-abrir-votacion"
              onClick={() => onTransition(formula.id, "voting")}
              type="button"
            >
              Abrir votación
            </button>
          )}

          {/* Boton para cerrar votacion con renderizado condicional */}
          {formula.estado === "voting" && puedeGestionar && (
            <button
              className="formula-detalle-boton-lock-cerrar-votacion"
              onClick={() => onTransition(formula.id, "closed")}
              type="button"
            >
              Cerrar votación
            </button>
          )}

          {/* Boton para destilar una formula con renderizado condicional */}
          {formula.estado === "closed" && puedeGestionar && (
            <button
              className="formula-detalle-boton-destilar-resultado"
              onClick={() => onDistill(formula.id)}
              type="button"
            >
              Destilar resultado
            </button>
          )}
        </div>
      </section>

      {/* Section que nos muestra el resultado de la destilacion en caso de que ocurra */}
      {formula.estado === "distilled" && pocion ? (
        <section className="formula-detalle-seccion-check-circle-resultado-destilado">
          <h2 className="formula-detalle-titulo-seccion-nombre">
            {pocion.nombre}
          </h2>
          <p className="formula-detalle-descripcion-efecto">{pocion.efecto}</p>
          <p className="formula-detalle-dato-destacado-dificultad-real">
            Dificultad {pocion.dificultadReal} · Rareza {pocion.rareza}
          </p>
          {/* Permite acceder rapidamente a la colección de pociones destiladas */}
          <Link className="formula-detalle-enlace-grimorio" to="/grimorio">
            Ver grimorio
          </Link>
        </section>
      ) : (
        <section className="formula-detalle-seccion-mesa-de-votacion-decide">
          {/* En el otro caso me deberia mostrar la info de votacion si la formula no esta destilada, no se encontro la pocion o la votacion ya esta cerrada */}
          <h2 className="formula-detalle-titulo-seccion-decide-la-composicion">
            Votación
          </h2>
          <p className="formula-detalle-texto-length-3-categorias-completadas">
            {Object.keys(votosUsuario).length}/3 categorías completadas
          </p>
          {!puedeVotar && (
            <p className="formula-detalle-descripcion-la-votacion-no-esta">
              Los resultados se muestran en modo de consulta.
            </p>
          )}
          <div className="formula-detalle-lista-vertical-map">
            {formula.categorias.map((categoria) => (
              <CategoriaVotacion
                categoria={categoria}
                key={categoria.id}
                votosFormula={votosTodos}
                onVeto={(categoriaId, opcionId) =>
                  onVeto(formula.id, categoriaId, opcionId)
                }
                onVote={(categoriaId, opcionId) =>
                  onVote(formula.id, categoriaId, opcionId)
                }
                // Solo miramos el voto del usuario conectado para marcar "Tu voto".
                opcionSeleccionada={votosUsuario[categoria.id]?.opcionId}
                pesoVoto={obtenerPesoVoto(
                  usuario,
                  categoria.id,
                  catadorOficial,
                )}
                puedeVetar={puedeVetar}
                puedeVotar={puedeVotar}
                veto={formula.veto}
              />
            ))}
          </div>
          <p className="formula-detalle-descripcion-tu-influencia">
            Tu rol: {rol} · Especialidad: {usuario.especialidad}
          </p>
          {formula.veto && (
            <p className="formula-detalle-descripcion-el-veto-de-esta">
              El veto ya fue utilizado.
            </p>
          )}
        </section>
      )}

      <section className="formula-detalle-seccion-registro-de-auditoria-map">
        <h2 className="formula-detalle-descripcion-registro-de-auditoria">
          Auditoría
        </h2>
        <div className="formula-detalle-lista-auditoria">
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <article
                className="formula-detalle-tarjeta-titulo-detalle-fecha"
                key={evento.id}
              >
                <h3 className="formula-detalle-titulo-tarjeta">
                  {evento.titulo}
                </h3>
                <p className="formula-detalle-descripcion-detalle">
                  {evento.detalle}
                </p>
                <time className="formula-detalle-elemento-time-fecha">
                  {formatearFecha(evento.fecha, true)}
                </time>
              </article>
            ))
          ) : (
            <p className="formula-detalle-descripcion-aun-no-hay-eventos">
              Sin eventos registrados.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default FormulaDetallePage;
