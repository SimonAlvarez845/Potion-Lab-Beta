import { useState } from "react";
import { FiBookOpen } from "react-icons/fi";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import EstadoVacio from "../components/common/EstadoVacio";
import { formatearFecha } from "../utils/formatters";

function GrimorioPage({ grimorio, gremios }) {
  const [busqueda, setBusqueda] = useState("");

  const pociones = grimorio.filter((pocion) =>
    `${pocion.nombre} ${pocion.efecto}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <div className="grimorio-lista-vertical-buscar-en-el-grimorio">
      <EncabezadoPagina descripcion="Archivo permanente y consultable de todas las combinaciones que llegaron a la etapa de destilación." etiqueta="Memoria del laboratorio" titulo="Grimorio de pociones" />

      <label className="grimorio-etiqueta-campo-buscar-en-el-grimorio">
        <span className="grimorio-texto-buscar-en-el-grimorio">Buscar en el grimorio</span>
        <input
          className="grimorio-campo-buscar-por-combinacion-o"
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Nombre o efecto..."
          value={busqueda}
        />
      </label>

      {pociones.length > 0 ? (
        <section className="grimorio-cuadricula-map">
          {pociones.map((pocion) => {
            const gremio = gremios.find((item) => item.id === pocion.gremioId);
            return (
              <article className="grimorio-tarjeta-star-rareza-rareza-nombre" key={pocion.id}>
                <p className="grimorio-texto-star-rareza-rareza">Rareza {pocion.rareza}</p>
                <div className="grimorio-contenedor-nombre-efecto">
                  <p className="grimorio-descripcion">{gremio?.nombre}</p>
                  <h2 className="grimorio-titulo-seccion-nombre">{pocion.nombre}</h2>
                  <p className="grimorio-descripcion-efecto">{pocion.efecto}</p>
                </div>
                <dl className="grimorio-lista-datos-dificultad-real-dificultad-real">
                  <div><dt className="grimorio-nombre-dato-dificultad-real">Dificultad real</dt><dd className="grimorio-valor-dato-dificultad-real">{pocion.dificultadReal}</dd></div>
                  <div><dt className="grimorio-nombre-dato-destilacion">Destilación</dt><dd className="grimorio-valor-dato-fecha">{formatearFecha(pocion.fechaDestilacion)}</dd></div>
                </dl>
              </article>
            );
          })}
        </section>
      ) : (
        <EstadoVacio descripcion="No hay resultados que coincidan con tu búsqueda actual." icono={FiBookOpen} titulo="El grimorio no encontró esa poción" />
      )}
    </div>
  );
}

export default GrimorioPage;
