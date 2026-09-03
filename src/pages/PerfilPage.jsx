import { useState } from "react";
import { ESPECIALIDADES } from "../data/seedData";

function PerfilPage({ usuario, onSaveProfile }) {
  const [formulario, setFormulario] = useState(usuario);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    onSaveProfile(formulario);
  }

  return (
    <div className="perfil-lista-vertical-identidad-alquimica-mi-perfil">
      <header>
        <h1 className="perfil-titulo-principal-mi-perfil">Mi perfil</h1>
        <p className="perfil-descripcion-actualiza-los-datos-visibles">
          Actualiza tus datos básicos.
        </p>
      </header>

      <form className="perfil-formulario-informacion-personal-la-autenticacion" onSubmit={manejarEnvio}>
        <label className="perfil-etiqueta-campo-user-nombre-completo">
          <span className="perfil-texto-user-nombre-completo">Nombre completo</span>
          <input
            className="perfil-campo-nombre-completo"
            name="nombreCompleto"
            onChange={manejarCambio}
            required
            value={formulario.nombreCompleto}
          />
        </label>

        <label className="perfil-etiqueta-campo-mail-correo-universitario">
          <span className="perfil-texto-mail-correo-universitario">Correo universitario</span>
          <input
            className="perfil-campo-email"
            name="email"
            onChange={manejarCambio}
            required
            type="email"
            value={formulario.email}
          />
        </label>

        <label className="perfil-etiqueta-campo-especialidad-map">
          <span className="perfil-texto-especialidad">Especialidad</span>
          <select
            className="perfil-selector-especialidad"
            name="especialidad"
            onChange={manejarCambio}
            value={formulario.especialidad}
          >
            {ESPECIALIDADES.map((especialidad) => (
              <option key={especialidad}>{especialidad}</option>
            ))}
          </select>
        </label>

        <label className="perfil-etiqueta-campo-image-url-del-avatar">
          <span className="perfil-texto-image-url-del-avatar">URL del avatar (opcional)</span>
          <input
            className="perfil-campo-avatar-url"
            name="avatarUrl"
            onChange={manejarCambio}
            type="url"
            value={formulario.avatarUrl}
          />
        </label>

        <button className="perfil-boton-save-guardar-cambios" type="submit">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

export default PerfilPage;
