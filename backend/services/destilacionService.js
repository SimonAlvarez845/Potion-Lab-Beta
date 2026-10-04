const Formula = require("../models/formula");

// La poción y sus recompensas dependen de los ganadores ya guardados.
function aplicarDestilacion(formula) {
  // Solo destilamos fórmulas cerradas que todavía no tengan una poción.
  if (formula.estado !== "closed" || formula.pocion) return;

  // Buscamos las opciones ganadoras de las tres categorías.
  const ingrediente = formula.ganadores.find(
    (g) => g.categoriaId === "ingrediente",
  )?.opcion;
  const metodo = formula.ganadores.find(
    (g) => g.categoriaId === "metodo",
  )?.opcion;
  const frasco = formula.ganadores.find(
    (g) => g.categoriaId === "frasco",
  )?.opcion;

  // No podemos crear la poción si falta alguno de los ganadores.
  if (!ingrediente || !metodo || !frasco) {
    throw new Error("La fórmula cerrada no tiene todos sus ganadores");
  }

  // Cada voto aporta una dificultad; los votos anteriores usan la propuesta.
  // reduce suma las dificultades y luego dividimos entre la cantidad de votos.
  const promedio =
    formula.votos.length === 0
      ? formula.dificultad
      : formula.votos.reduce(
          (total, voto) => total + (voto.dificultad ?? formula.dificultad),
          0,
        ) / formula.votos.length;

  // La dificultad real combina el promedio con el peso del ingrediente y del método.
  const dificultadReal = promedio + ingrediente.peso + metodo.peso;

  // Calculamos la rareza usando la dificultad real y los pesos ganadores.
  const rareza = dificultadReal * 10 + ingrediente.peso * 3 + metodo.peso * 2;

  // Construimos la poción con los resultados de la votación.
  formula.pocion = {
    nombre: `${ingrediente.nombre} + ${metodo.nombre} en ${frasco.nombre}`,
    efecto: formula.efectoDeseado,
    dificultadReal,
    rareza,
    fechaDestilacion: new Date(),

    // Guardamos qué opción ganó y cómo se decidió cada categoría.
    decisiones: formula.ganadores.map((ganador) => ({
      categoriaId: ganador.categoriaId,
      opcion: ganador.opcion.nombre,
      metodo: ganador.metodo,
    })),
  };

  // La fórmula pasa de cerrada a destilada.
  formula.estado = "distilled";

  // Registramos los resultados en el historial de la fórmula.
  for (const ganador of formula.ganadores) {
    formula.auditoria.push({
      titulo: "Resultado de categoría",
      detalle: `${ganador.categoriaId}: ${ganador.opcion.nombre}; ${ganador.metodo}.`,
    });
  }

  // Dejamos constancia de que la poción fue destilada.
  formula.auditoria.push({
    titulo: "Poción destilada",
    detalle:
      "La poción quedó en el grimorio. Su autor recibe 20 puntos y su rareza.",
  });
}

// Destila una fórmula solicitada por un usuario autorizado.
async function destilar(id, usuario) {
  const { obtenerFormula, presentarFormula } = require("./formulaService");
  const { obtenerGremio } = require("./gremioService");
  const { exigirRol } = require("../utils/roles");

  // Recuperamos la fórmula y el gremio al que pertenece.
  const formula = await obtenerFormula(id);
  const gremio = await obtenerGremio(formula.gremioId);

  // Solo el Gran Maestre o el Alquimista sénior pueden solicitar la destilación.
  exigirRol(gremio, usuario._id, ["Gran Maestre", "Alquimista sénior"]);

  // Si ya está destilada, devolvemos la fórmula sin repetir el proceso.
  if (formula.estado === "distilled") return presentarFormula(formula);

  // No permitimos destilar fórmulas que todavía no hayan cerrado.
  if (formula.estado !== "closed") {
    const error = new Error("Solo se destilan fórmulas cerradas");
    error.status = 409;
    throw error;
  }

  // Creamos la poción, guardamos los cambios y devolvemos la fórmula.
  aplicarDestilacion(formula);
  await formula.save();

  return presentarFormula(formula);
}

// Devuelve las pociones destiladas que se mostrarán en el grimorio.
async function listarGrimorio(filtros) {
  const { presentarFormula } = require("./formulaService");

  // Solo consultamos fórmulas que ya tienen el estado de destiladas.
  const consulta = { estado: "distilled" };

  // Si recibimos un gremioId, filtramos las pociones de ese gremio.
  if (filtros.gremioId) consulta.gremioId = filtros.gremioId;

  // Ordenamos desde la poción destilada más reciente.
  const formulas = await Formula.find(consulta).sort({
    "pocion.fechaDestilacion": -1,
  });

  // Pasamos el texto de búsqueda a minúsculas para facilitar la comparación.
  const texto = (filtros.q || "").toLowerCase();

  return (
    formulas
      // Buscamos coincidencias en el nombre o efecto de las pociones.
      .filter(
        (f) =>
          f.pocion &&
          `${f.pocion.nombre} ${f.pocion.efecto}`.toLowerCase().includes(texto),
      )

      // Devolvemos únicamente la información de la poción para el frontend.
      .map((f) => presentarFormula(f).pocion)
  );
}

module.exports = { aplicarDestilacion, destilar, listarGrimorio };
