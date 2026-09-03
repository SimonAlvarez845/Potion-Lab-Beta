import { useState } from "react";
import { Link } from "react-router-dom";
import { FiLayers } from "react-icons/fi";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import EstadoVacio from "../components/common/EstadoVacio";
import TarjetaFormula from "../components/formula/TarjetaFormula";

function FormulasPage({ formulas, gremios, usuarios, votos }) {
  // Estado de la busqueda
  const [busqueda, setBusqueda] = useState("");

  // Busqueda sencilla (por nombre y efecto de la pocion)
  const formulasFiltradas = formulas.filter((formula) =>
    `${formula.nombrePocion} ${formula.efectoDeseado}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <div className="formulas-lista-vertical-buscar-formulas-search-filter">
      <EncabezadoPagina
        acciones={
          <Link className="formulas-enlace-formulas-nueva" to="/formulas/nueva">
            Nueva fórmula
          </Link>
        }
        descripcion="Consulta las fórmulas y participa en sus votaciones."
        etiqueta="Laboratorio"
        titulo="Fórmulas"
      />

      <label className="formulas-etiqueta-campo-buscar-formulas-search">
        <span className="formulas-texto-buscar-formulas">Buscar fórmulas</span>
        <input
          className="formulas-campo-buscar-formula-o-efecto"
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Nombre o efecto..."
          value={busqueda}
        />
      </label>

      <p className="formulas-contenedor-flexible-length-formulas-encontradas-ordenadas">
        {formulasFiltradas.length} fórmulas encontradas
      </p>

      {/* Si existen resultados muestra tarjetas, sino muestra el estado vacío. */}
      {formulasFiltradas.length > 0 ? (
        <section className="formulas-cuadricula-map">
          {formulasFiltradas.map((formula) => (
            <TarjetaFormula
              creador={usuarios.find((item) => item.id === formula.creadaPorId)}
              formula={formula}
              gremio={gremios.find((item) => item.id === formula.gremioId)}
              key={formula.id}
              votosCompletados={Object.keys(votos[formula.id] ?? {}).length}
            />
          ))}
        </section>
      ) : (
        <EstadoVacio
          descripcion="Prueba con otro nombre o efecto."
          icono={FiLayers}
          titulo="No hay fórmulas con ese criterio"
        />
      )}
    </div>
  );
}

export default FormulasPage;
