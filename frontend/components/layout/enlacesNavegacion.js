import { FiAward, FiBookOpen, FiGrid, FiLayers, FiUsers } from "react-icons/fi";

// Iconos de Feather usados mediante React Icons: https://feathericons.com/

// No crea la navbar pero guarda los datos para poderla construir luego
// Evita escribir manualmente los 5 links que son casi que iguales en BarraLateral.jsx

const enlacesNavegacion = [
  { to: "/", etiqueta: "Resumen", icono: FiGrid, exacto: true },
  { to: "/gremios", etiqueta: "Gremios", icono: FiUsers },
  { to: "/formulas", etiqueta: "Formulas", icono: FiLayers },
  { to: "/grimorio", etiqueta: "Grimorio", icono: FiBookOpen },
  { to: "/ranking", etiqueta: "Ranking", icono: FiAward },
];

export default enlacesNavegacion;
