import { useState } from "react";
import { FiUsers } from "react-icons/fi";
import EncabezadoPagina from "../components/common/EncabezadoPagina";
import EstadoVacio from "../components/common/EstadoVacio";
import TarjetaGremio from "../components/gremio/TarjetaGremio";

const formularioInicial = {
  nombre: "",
  lema: "",
  tipo: "publico",
  emblemaUrl: "",
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

  // Bloquea los forms mientras se procesa una petición.
  const [cargando, setCargando] = useState(false);

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

  async function manejarCrear(evento) {
    evento.preventDefault();
    if (cargando) return;

    setErrorCrear("");
    setCargando(true);

    try {
      const resultado = await onCreateGuild({
        ...formulario,
        descripcion: `Gremio creado por ${usuario.nombreCompleto}.`,
      });

      if (!resultado.ok) {
        setErrorCrear(resultado.mensaje);
        return;
      }

      setFormulario(formularioInicial);
    } catch (error) {
      setErrorCrear("No fue posible crear el gremio.");
    } finally {
      setCargando(false);
    }
  }

  async function manejarUnion(gremio) {
    if (cargando) return;

    if (gremio.tipo === "privado") {
      setUnion({ gremio, codigo: "", error: "" });
      return;
    }

    setCargando(true);

    try {
      const resultado = await onJoinGuild(gremio.id, "");

      if (!resultado.ok) {
        setUnion({
          gremio,
          codigo: "",
          error: resultado.mensaje,
        });
      }
    } catch (error) {
      setUnion({
        gremio,
        codigo: "",
        error: "No fue posible unirse al gremio.",
      });
    } finally {
      setCargando(false);
    }
  }

  async function validarCodigo(evento) {
    evento.preventDefault();
    if (cargando) return;

    setCargando(true);

    try {
      const resultado = await onJoinGuild(union.gremio.id, union.codigo);

      if (!resultado.ok) {
        setUnion((anterior) => ({
          ...anterior,
          error: resultado.mensaje,
        }));
        return;
      }

      setUnion(unionInicial);
    } catch (error) {
      setUnion((anterior) => ({
        ...anterior,
        error: "No fue posible validar el código.",
      }));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="gremios-lista-vertical-buscar-gremios-search-mostrar">
      <EncabezadoPagina
        descripcion="Busca una comunidad o crea un gremio con sus datos básicos."
        etiqueta="Comunidad alquímica"
        titulo="Gremios"
      />

      <form
        className="gremios-formulario-nombre-del-gremio-lema"
        onSubmit={manejarCrear}
      >
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
            disabled={cargando}
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
            disabled={cargando}
          />
        </label>
        <label className="gremios-etiqueta-campo-lema">
          <span className="gremios-texto-lema">URL del emblema</span>
          <input
            className="gremios-campo-lema"
            name="emblemaUrl"
            onChange={manejarCambio}
            type="url"
            value={formulario.emblemaUrl}
            disabled={cargando}
          />
        </label>
        <label className="gremios-etiqueta-campo-visibilidad-publico-privado">
          <span className="gremios-texto-visibilidad">Tipo</span>
          <select
            className="gremios-selector-publico-privado"
            name="tipo"
            onChange={manejarCambio}
            value={formulario.tipo}
            disabled={cargando}
          >
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
          </select>
        </label>
        {errorCrear && (
          <p className="gremios-descripcion-error">{errorCrear}</p>
        )}
        <button className="gremios-boton-crear-gremio" type="submit">
          {cargando ? "Creando..." : "Crear gremio"}
        </button>
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
              cargando={cargando}
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
        <form
          className="gremios-formulario-lock-codigo-de-invitacion"
          onSubmit={validarCodigo}
        >
          <h2 className="gremios-texto-lock-codigo-de-invitacion">
            Código de {union.gremio.nombre}
          </h2>

          <input
            className="gremios-campo-codigo-invitacion"
            maxLength="6"
            onChange={(evento) =>
              setUnion((anterior) => ({
                ...anterior,
                codigo: evento.target.value.toUpperCase(),
                error: "",
              }))
            }
            required
            value={union.codigo}
            disabled={cargando}
          />

          {union.error && <p className="gremios-error-union">{union.error}</p>}
          <button
            className="gremios-boton-validar-y-unirme"
            type="submit"
            disabled={cargando}
          >
            {cargando ? "Uniendome..." : "Unirme"}
          </button>

          <button
            onClick={() => setUnion(unionInicial)}
            type="button"
            disabled={cargando}
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}

export default GremiosPage;
