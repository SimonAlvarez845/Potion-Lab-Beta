import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { crearCategorias } from "../data/seedData";
import { puedeCrearFormula } from "../utils/roles";

// useNavigate (para navegar desde una funcion y hacer que el codigo cambie de ruta después de una operación y useSearchParams(leer params despues de ? en un link)

// Tener en cuenta: La autorización depende de la relación del usuario con cada gremio.
// Si bien no se menciona para crear una fórmula en un gremio deben cumplirse simultáneamente dos condiciones: 1. Ser Gran Maestre o Alquimista sénior en ese gremio. 2.Tener una participación igual o superior al 30%. Ej) David no puede, Simon si puede.

// Funcion (la buscamos): Recibe objeto Date y devuelve fecha con el formato que requiere un <input>
function fechaParaInput(fecha) {
  const ajusteZona = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - ajusteZona).toISOString().slice(0, 10);
}

function NuevaFormulaPage({ usuario, gremios, onCreateFormula }) {
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Se calcula la fecha directamente porque solo necesitamos sumar siete días.
  const hoy = new Date();
  const fechaMaxima = new Date();

  // Necesitamos poder actualizar y usar los 7 dias ent ya con esto tenemos de lunes a viernes (no incluido)
  fechaMaxima.setDate(fechaMaxima.getDate() + 7); 

  // Coloca la fecha máxima al final del día para poder usar el septimo dia
  fechaMaxima.setHours(23, 59, 59, 999);

  const gremiosPermitidos = gremios.filter((gremio) => puedeCrearFormula(gremio, usuario));

  // obtiene el gremio que le indica el link (g1,g2,etc)
  const gremioInicial = searchParams.get("gremio");

  // necesitamos indicarle al usuario en caso de que la fecha no este entre "hoy" y sus prox 7 dias
  const [error, setError] = useState("");

  // el form valida si el link contiene un gremio autorizado para crear formulas (como es un input aca se llama la funcion fechaparaInput)
  const [formulario, setFormulario] = useState({
    gremioId: gremiosPermitidos.some((gremio) => gremio.id === gremioInicial)
      ? gremioInicial
      : (gremiosPermitidos[0]?.id ?? ""),
    nombrePocion: "",
    efectoDeseado: "",
    dificultad: "2",
    fechaCierre: fechaParaInput(fechaMaxima),
  });

  // Handler de cambio generico para un form
  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
    setError("");
  }

  // Handler de envio generico para un form, ademas notificamos los posibles errores al crear formula
  function manejarEnvio(evento) {
    evento.preventDefault();
    const cierre = new Date(`${formulario.fechaCierre}T23:59:00`);
    // Le agregamos una hora para que quede claro exactamente cuando se cierra

    if (cierre < hoy || cierre > fechaMaxima) {
      setError("La fecha debe estar entre hoy y los próximos 7 días.");
      return;
    }

    // Entrega un resultado que puede contener el objeto con todos los datos preparados, castea la dificultad de string a numero, la fecha a ISO y crea las crearCategorias() usando el seedData.js
    const resultado = onCreateFormula({
      ...formulario,
      dificultad: Number(formulario.dificultad),
      fechaCierre: cierre.toISOString(),
      categorias: crearCategorias(),
    });

    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }

    navigate(`/formulas/${resultado.formulaId}`);
  }

  if (gremiosPermitidos.length === 0) {
    return (
      <div className="nueva-formula-contenedor-arrow-left-volver-a">
        <h1 className="nueva-formula-titulo-principal-aun-no-puedes-crear">
          No puedes crear fórmulas
        </h1>
        <p className="nueva-formula-descripcion-necesitas-ser-gran-maestre">
          Necesitas un rol autorizado y al menos 30% de participación.
        </p>
        <Link className="nueva-formula-enlace-gremios" to="/gremios">Ver gremios</Link>
      </div>
    );
  }

  return (
    <div className="nueva-formula-lista-vertical-arrow-left-volver-a">
      <Link className="nueva-formula-enlace-volver-formulas" to="/formulas">Volver a fórmulas</Link>

      <header>
        <h1 className="nueva-formula-titulo-principal-disena-una-formula-base">Nueva fórmula</h1>
        <p className="nueva-formula-descripcion-define-el-proposito-y">
          Completa los datos básicos de la propuesta.
        </p>
      </header>

      <form className="nueva-formula-formulario-layers-datos-de-la" onSubmit={manejarEnvio}>
        <label className="nueva-formula-etiqueta-campo-gremio-responsable-map">
          <span className="nueva-formula-texto-gremio-responsable">Gremio</span>
          <select
            className="nueva-formula-selector-gremio-id"
            name="gremioId"
            onChange={manejarCambio}
            value={formulario.gremioId}
          >
            {gremiosPermitidos.map((gremio) => (
              <option key={gremio.id} value={gremio.id}>{gremio.nombre}</option>
            ))}
          </select>
        </label>

        <label className="nueva-formula-etiqueta-campo-nombre-de-la-pocion">
          <span className="nueva-formula-texto-nombre-de-la-pocion">Nombre</span>
          <input
            className="nueva-formula-campo-nombre-pocion"
            maxLength="50"
            name="nombrePocion"
            onChange={manejarCambio}
            required
            value={formulario.nombrePocion}
          />
        </label>

        <label className="nueva-formula-etiqueta-campo-efecto-deseado-length-200">
          <span className="nueva-formula-texto-efecto-deseado-length-200">Efecto deseado</span>
          <textarea
            className="nueva-formula-area-texto-efecto-deseado"
            maxLength="200"
            name="efectoDeseado"
            onChange={manejarCambio}
            required
            value={formulario.efectoDeseado}
          />
        </label>

        <label className="nueva-formula-etiqueta-campo-dificultad-propuesta-facil">
          <span className="nueva-formula-texto-dificultad-propuesta">Dificultad</span>
          <select
            className="nueva-formula-selector-dificultad"
            name="dificultad"
            onChange={manejarCambio}
            value={formulario.dificultad}
          >
            <option value="1">Fácil</option>
            <option value="2">Media</option>
            <option value="3">Difícil</option>
            <option value="4">Arcana</option>
          </select>
        </label>

        <label className="nueva-formula-etiqueta-campo-calendar-fecha-de-cierre">
          <span className="nueva-formula-texto-calendar-fecha-de-cierre">Fecha de cierre</span>
          <input
            className="nueva-formula-campo-fecha-cierre"
            max={fechaParaInput(fechaMaxima)}
            min={fechaParaInput(hoy)}
            name="fechaCierre"
            onChange={manejarCambio}
            required
            type="date"
            value={formulario.fechaCierre}
          />
        </label>

        {error && <p className="nueva-formula-descripcion-error">{error}</p>}
        <button className="nueva-formula-boton-guardar-como-propuesta" type="submit">
          Crear propuesta
        </button>
      </form>
    </div>
  );
}

export default NuevaFormulaPage;
