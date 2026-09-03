import { Link, useParams } from "react-router-dom";
import TarjetaFormula from "../components/formula/TarjetaFormula";
import ListaMiembros from "../components/gremio/ListaMiembros";
import { puedeAdministrarGremio, puedeCrearFormula } from "../utils/roles";

function GremioDetallePage({
  usuario,
  usuarios,
  gremios,
  formulas,
  votos,
  onChangeRole,
  onAppointTaster,
}) {
  const { gremioId } = useParams();
  const gremio = gremios.find((item) => item.id === gremioId);

  if (!gremio) {
    return (
      <div className="gremio-detalle-contenedor-gremio-no-encontrado-volver">
        <h1 className="gremio-detalle-titulo-principal-gremio-no-encontrado">Gremio no encontrado</h1>
        <Link className="gremio-detalle-enlace-gremios" to="/gremios">Volver a gremios</Link>
      </div>
    );
  }

  const formulasGremio = formulas.filter((formula) => formula.gremioId === gremio.id);
  const puedeAdministrar = puedeAdministrarGremio(gremio, usuario.id);
  const puedeCrear = puedeCrearFormula(gremio, usuario);

  return (
    <div className="gremio-detalle-lista-vertical-arrow-left-volver-a">
      <Link className="gremio-detalle-enlace-volver-gremios" to="/gremios">Volver a gremios</Link>

      <section className="gremio-detalle-seccion-gremio-publico-nombre">
        <p className="gremio-detalle-descripcion-gremio-publico">
          Gremio {gremio.tipo === "publico" ? "público" : "privado"}
        </p>
        <h1 className="gremio-detalle-titulo-principal-nombre">{gremio.nombre}</h1>
        <p className="gremio-detalle-descripcion-lema">“{gremio.lema}”</p>
        <p className="gremio-detalle-descripcion">{gremio.descripcion}</p>
        {puedeCrear && (
          <Link
            className="gremio-detalle-enlace-formulas-nueva-gremio"
            to={`/formulas/nueva?gremio=${gremio.id}`}
          >
            Nueva fórmula
          </Link>
        )}
      </section>

      <section className="gremio-detalle-seccion-sala-del-gremio-miembros">
        <h2 className="gremio-detalle-titulo-seccion-miembros-y-roles">
          Miembros ({gremio.miembros.length})
        </h2>
        <ListaMiembros
          gremio={gremio}
          onAppointTaster={(usuarioId) => onAppointTaster(gremio.id, usuarioId)}
          onChangeRole={(usuarioId, rol) => onChangeRole(gremio.id, usuarioId, rol)}
          puedeAdministrar={puedeAdministrar}
          usuarios={usuarios}
        />
      </section>

      <section>
        <div className="gremio-detalle-contenedor-flexible-mesa-de-trabajo-formulas">
          <h2 className="gremio-detalle-titulo-seccion-formulas-del-gremio">
            Fórmulas ({formulasGremio.length})
          </h2>
          <Link className="gremio-detalle-enlace-formulas" to="/formulas">Ver todas</Link>
        </div>
        <div className="gremio-detalle-cuadricula-map">
          {formulasGremio.slice(0, 6).map((formula) => (
            <TarjetaFormula
              creador={usuarios.find((item) => item.id === formula.creadaPorId)}
              formula={formula}
              gremio={gremio}
              key={formula.id}
              votosCompletados={Object.keys(votos[formula.id] ?? {}).length}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default GremioDetallePage;
