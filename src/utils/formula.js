import { calcularGanador, obtenerPesoVoto } from "./voting";

export const TRANSICIONES_VALIDAS = {
  proposal: "voting",
  voting: "closed",
  closed: "distilled",
};

// Toma una formula cerrada y los resultados de voting para construir una pocion
export function crearPocionDesdeFormula(
  formula,
  votosFormula,
  usuario,
  catadorOficial,
) {
  // Recorre cada categoria y calcula el peso, luego determina el ganador
  const ganadores = formula.categorias.map((categoria) => {
    const peso = obtenerPesoVoto(usuario, categoria.id, catadorOficial);
    return {
      categoriaId: categoria.id,
      ...calcularGanador(
        categoria,
        formula,
        votosFormula?.[categoria.id],
        peso,
      ),
    };
  });

  // Busca el ingrediente ganador
  const ingrediente = ganadores.find(
    (item) => item.categoriaId === "ingrediente",
  );

  // Busca el metodo ganador
  const metodo = ganadores.find((item) => item.categoriaId === "metodo");

  // Busca el frasco ganador
  const frasco = ganadores.find((item) => item.categoriaId === "frasco");

  // Calculos dados por el enunciado
  const dificultadReal = Math.round(
    formula.dificultad + ingrediente.opcion.peso + metodo.opcion.peso,
  );
  const rareza = Math.round(
    formula.dificultad * 10 +
      ingrediente.opcion.peso * 3 +
      metodo.opcion.peso * 2,
  );

  // Construye el objeto pocion
  return {
    id: `p-${Date.now()}`,
    formulaId: formula.id,
    gremioId: formula.gremioId,
    nombre: `${ingrediente.opcion.nombre} + ${metodo.opcion.nombre} en ${frasco.opcion.nombre}`,
    efecto: formula.efectoDeseado,
    dificultadReal,
    rareza,
    fechaDestilacion: new Date().toISOString(),
    decisiones: ganadores.map((item) => ({
      categoriaId: item.categoriaId,
      opcion: item.opcion.nombre,
      metodo: item.metodo,
    })),
  };
}
