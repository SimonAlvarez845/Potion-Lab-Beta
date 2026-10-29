import { FiCheckCircle } from "react-icons/fi";

// Componente reutilizable para mostrar mensajes temporales al usuario.
function Aviso({ mensaje, onCerrar }) {
  // Si no hay mensaje no muestra nada
  if (!mensaje) return null;

  // Es una notificacion que aparece en la parte derecha inferior de la pantalla. Se usa en App.jsx
  // Se puede probar facilmente al realizar cambios en tu perfil y clickear el boton "Guardar cambios"
  return (
    <div className="aviso-contenedor-flexible-check-circle-mensaje-x">
      <FiCheckCircle className="aviso-icono-check-circle" />
      <span className="aviso-texto-mensaje">{mensaje}</span>
      <button className="aviso-boton-cerrar-aviso" onClick={onCerrar}></button>
    </div>
    // onCerrar esta vacio por su useState de App.jsx por lo cual al clickear en la X el mensaje "se va a cerrar" pero lo que realmente pasa es que el render vuelve a entrar al if
  );
}

export default Aviso;
