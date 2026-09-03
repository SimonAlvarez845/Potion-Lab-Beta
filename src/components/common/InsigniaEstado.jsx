import { ESTADOS_FORMULA } from "../../data/seedData";

// Componente reutilizable que actua como traductor de estados. Se usa en el menu de "Formulas"
// Le dice a React que texto que debe mostrar y que clase de color que debe usar: cada texto usa una distinta

// Muestra una insignia visual según el estado actual de una fórmula.
function InsigniaEstado({ estado }) {

  // Busca la configuración del estado recibido.
  // Si el estado no existe, usa "proposal" como valor por defecto.
  const configuracion = ESTADOS_FORMULA[estado] ?? ESTADOS_FORMULA.proposal;

  // Relaciona el tono del estado con una clase CSS diferente.
  const tonos = {
    slate: "insignia-estado-tono-neutro",
    cyan: "insignia-estado-tono-cian",
    amber: "insignia-estado-tono-ambar",
    violet: "insignia-estado-tono-violeta",
  };

  // Variable que almacene la informacion y el color 
  const claseTono = tonos[configuracion.tono];

  // Devuelve la etiqueta con la insignia completa
  return (
      <span className={`insignia-estado-etiqueta ${claseTono}`}>      
      <span className="insignia-estado-indicador" />
      {configuracion.etiqueta}
    </span>
  );
}

export default InsigniaEstado;
