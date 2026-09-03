import { Link } from "react-router-dom";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import TarjetaFormula from "../components/formula/TarjetaFormula";
import TarjetaGremio from "../components/gremio/TarjetaGremio";

// Es el panel principal de la App y lo primero que se ve al entrar a tu cuenta
// Se encarga de: recibir y filtrar datos --> calcular indicadores --> mostrar los accesos mediante las tarjetas 
function ResumenPage({ usuario, gremios, formulas, votos, usuarios }) {
  
    // Almacena los gremios donde aparece el usuario conectado.

  const misGremios = gremios.filter((gremio) =>
    gremio.miembros.some((miembro) => miembro.usuarioId === usuario.id),
  );

  // Almacena las formulas en votación que pertenecen a los gremios del usuario.
  const formulasActivas = formulas.filter((formula) =>
    formula.estado === "voting"
      && misGremios.some((gremio) => gremio.id === formula.gremioId),
  );

  return (
    <div className="resumen-lista-vertical-ver-todas-arrow-right">
      <EncabezadoPagina
        acciones={
          <Link className="resumen-enlace-formulas-nueva" to="/formulas/nueva">
            Nueva fórmula
          </Link>
        }
        descripcion="Revisa rápidamente tus gremios y votaciones abiertas."
        etiqueta="Panel principal"
        titulo={`Hola, ${usuario.nombreCompleto.split(" ")[0]}`}
      />

      <section className="resumen-cuadricula-indicadores-personales">
        <p>Puntos: <strong>{usuario.puntos}</strong></p>
        <p>Gremios: <strong>{misGremios.length}</strong></p>
        <p>Votaciones abiertas: <strong>{formulasActivas.length}</strong></p>
        <p>Participación: <strong>{usuario.participacion}%</strong></p>
      </section>

      <section>
        <div className="resumen-contenedor-flexible-prioridad-del-laboratorio-formulas">
          <h2 className="resumen-titulo-seccion-formulas-que-requieren-atencion">
            Fórmulas para votar
          </h2>
          <Link className="resumen-enlace-formulas" to="/formulas">Ver todas</Link>
        </div>
        <div className="resumen-cuadricula-map">
          {/* Resumen muestra max dos fórmulas activas. Si la formula no tiene votos usa un objeto vacio. Funciona contando las categorías votadas dentro de cada formula con Object.keys().length  */}
          {formulasActivas.slice(0, 2).map((formula) => (
            <TarjetaFormula
              creador={usuarios.find((item) => item.id === formula.creadaPorId)}
              formula={formula}
              gremio={gremios.find((item) => item.id === formula.gremioId)}
              key={formula.id}
              votosCompletados={Object.keys(votos[formula.id] ?? {}).length}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="resumen-contenedor-flexible-comunidad-tus-gremios-explorar">
          <h2 className="resumen-titulo-seccion-tus-gremios">Tus gremios</h2>
          <Link className="resumen-enlace-gremios" to="/gremios">Ver todos</Link>
        </div>
        <div className="resumen-cuadricula-mis-gremios">
          {/* Resumen muestra max tres gremios */}
          {misGremios.slice(0, 3).map((gremio) => (
            <TarjetaGremio
              gremio={gremio}
              key={gremio.id}
              usuarioId={usuario.id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ResumenPage;
