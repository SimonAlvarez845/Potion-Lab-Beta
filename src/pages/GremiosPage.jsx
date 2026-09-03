import { useState } from "react";
import { FiUsers } from "react-icons/fi";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import EstadoVacio from "../components/common/EstadoVacio";
import TarjetaGremio from "../components/gremio/TarjetaGremio";

const formularioInicial = {
  nombre: "",
  lema: "",
  tipo: "publico",
};

const unionInicial = {
  gremio: null,
  codigo: "",
  error: "",
};

function GremiosPage({ usuario, gremios, onCreateGuild, onJoinGuild }) {
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState(formularioInicial);
  const [union, setUnion] = useState(unionInicial);
  const [errorCrear, setErrorCrear] = useState("");

  const gremiosFiltrados = gremios.filter((gremio) =>
    `${gremio.nombre} ${gremio.lema}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
    setErrorCrear("");
  }

  function manejarCrear(evento) {
    evento.preventDefault();
    const resultado = onCreateGuild({
      ...formulario,
      descripcion: `Gremio creado por ${usuario.nombreCompleto}.`,
      emblemaUrl: "",
    });

    if (!resultado.ok) {
      setErrorCrear(resultado.mensaje);
      return;
    }

    setFormulario(formularioInicial);
  }

  function manejarUnion(gremio) {
    if (gremio.tipo === "publico") {
      onJoinGuild(gremio.id, "");
      return;
    }

    setUnion({ gremio, codigo: "", error: "" });
  }

  function validarCodigo(evento) {
    evento.preventDefault();
    const resultado = onJoinGuild(union.gremio.id, union.codigo);

    if (!resultado.ok) {
      setUnion((anterior) => ({ ...anterior, error: resultado.mensaje }));
      return;
    }

    setUnion(unionInicial);
  }

  return (
    <div className="gremios-lista-vertical-buscar-gremios-search-mostrar">
      <EncabezadoPagina
        descripcion="Busca una comunidad o crea un gremio con sus datos básicos."
        etiqueta="Comunidad alquímica"
        titulo="Gremios"
      />

      <form className="gremios-formulario-nombre-del-gremio-lema" onSubmit={manejarCrear}>
        <h2 className="gremios-texto-nombre-del-gremio">Crear gremio</h2>
        <label className="gremios-etiqueta-campo-nombre-del-gremio">
          <span className="gremios-texto-nombre-del-gremio">Nombre</span>
          <input
            className="gremios-campo"
            maxLength="50"
            name="nombre"
            onChange={manejarCambio}
            required
            value={formulario.nombre}
          />
        </label>
        <label className="gremios-etiqueta-campo-lema">
          <span className="gremios-texto-lema">Lema</span>
          <input
            className="gremios-campo-lema"
            maxLength="90"
            name="lema"
            onChange={manejarCambio}
            required
            value={formulario.lema}
          />
        </label>
        <label className="gremios-etiqueta-campo-visibilidad-publico-privado">
          <span className="gremios-texto-visibilidad">Tipo</span>
          <select
            className="gremios-selector-publico-privado"
            name="tipo"
            onChange={manejarCambio}
            value={formulario.tipo}
          >
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
          </select>
        </label>
        {errorCrear && <p className="gremios-descripcion-error">{errorCrear}</p>}
        <button className="gremios-boton-crear-gremio" type="submit">Crear gremio</button>
      </form>

      <label className="gremios-etiqueta-campo-buscar-gremios-search">
        <span className="gremios-texto-buscar-gremios">Buscar gremios</span>
        <input
          className="gremios-campo-buscar-por-nombre-o"
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Nombre o lema..."
          value={busqueda}
        />
      </label>

      {gremiosFiltrados.length > 0 ? (
        <section className="gremios-cuadricula-map">
          {gremiosFiltrados.map((gremio) => (
            <TarjetaGremio
              gremio={gremio}
              key={gremio.id}
              onJoin={manejarUnion}
              usuarioId={usuario.id}
            />
          ))}
        </section>
      ) : (
        <EstadoVacio
          descripcion="Prueba con otro nombre o lema."
          icono={FiUsers}
          titulo="No encontramos gremios"
        />
      )}

      {union.gremio && (
        <form className="gremios-formulario-lock-codigo-de-invitacion" onSubmit={validarCodigo}>
          <h2 className="gremios-texto-lock-codigo-de-invitacion">
            Código de {union.gremio.nombre}
          </h2>
          <input
            className="gremios-campo-codigo-invitacion"
            maxLength="6"
            onChange={(evento) => setUnion((anterior) => ({
              ...anterior,
              codigo: evento.target.value.toUpperCase(),
              error: "",
            }))}
            required
            value={union.codigo}
          />
          {union.error && <p className="gremios-error-union">{union.error}</p>}
          <button className="gremios-boton-validar-y-unirme" type="submit">Unirme</button>
          <button onClick={() => setUnion(unionInicial)} type="button">Cancelar</button>
        </form>
      )}
    </div>
  );
}

export default GremiosPage;
