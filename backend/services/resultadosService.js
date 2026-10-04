// Reglas puras compartidas por consultas, cierre y pruebas; no acceden a MongoDB.
const ESPECIALIDAD = {
  ingrediente: "Herbalista",
  metodo: "Runista",
  frasco: "Catador",
};

// Comprueba, segun especialidad y cargo, el peso correspondiente al voto.
function obtenerPesoVoto(usuario, categoriaId, catador) {
  const especialista =
    usuario.especialidad === "Maestro cervecero" ||
    usuario.especialidad === ESPECIALIDAD[categoriaId];

  // Especialista: x1.2, Catador oficial: x2, ambos: x2.4.
  return (especialista ? 1.2 : 1) * (catador ? 2 : 1);
}

// OJO: Los votos simulados del seed no son votos reales de la API.
// Calcula los votos y porcentajes de cada opción, excluyendo la opción vetada del total válido.
function calcularResultados(categoria, votos, veto) {
  const opciones = categoria.opciones.map((opcion) => {
    // Forma ingeniosa para ahorrarse todos los errores con decimales: Sumar en decimas enteras
    const decimas = votos
      .filter((v) => v.categoriaId === categoria.id && v.opcionId === opcion.id)
      .reduce((total, voto) => total + Math.round(voto.peso * 10), 0);
    return {
      id: opcion.id,
      nombre: opcion.nombre,
      sigla: opcion.sigla,
      peso: opcion.peso,
      votosIniciales: 0,
      totalVotos: decimas / 10,
      vetada:
        veto?.categoriaId === categoria.id && veto?.opcionId === opcion.id,
    };
  });

  // Calcula el total de votos válidos sin incluir la opción vetada.
  const total = opciones
    .filter((o) => !o.vetada)
    .reduce((suma, o) => suma + Math.round(o.totalVotos * 10), 0);

  // Calcula el porcentaje de cada opción respecto al total válido.
  return opciones.map((o) => ({
    ...o,
    porcentaje:
      o.vetada || total === 0
        ? 0
        : Math.round((Math.round(o.totalVotos * 10) / total) * 100),
  }));
}
// Calcula los resultados de cada categoría y resuelve los empates.
// Devuelve un arreglo con los ganadores y el método utilizado para elegirlos.
function calcularGanadores(formula, gremio) {
  return formula.categorias.map((categoria) => {
    // Obtiene los resultados de la categoría excluyendo lo vetado
    const opciones = calcularResultados(
      categoria,
      formula.votos,
      formula.veto,
    ).filter((o) => !o.vetada);

    // Busca el max de votos y opciones que empataron.
    const maximo = Math.max(...opciones.map((o) => o.totalVotos));
    const empatadas = opciones.filter((o) => o.totalVotos === maximo);

    // C1: Si solo una opción tiene el máximo, gana por mayoría simple.
    if (empatadas.length === 1)
      return {
        categoriaId: categoria.id,
        opcion: empatadas[0],
        metodo: "mayoría simple",
      };

    // C2: Si hay empate se aplica la logica del negocio.
    // NOTA: Catador actual -> GM actual -> azar. Sin votos también existe un empate a cero.
    for (const rol of ["Catador oficial", "Gran Maestre"]) {
      const miembro = gremio.miembros.find((m) => m.rol === rol);
      const voto = formula.votos.find(
        (v) =>
          String(v.usuarioId) === String(miembro?.usuarioId) &&
          v.categoriaId === categoria.id,
      );

      // Comprueba si el miembro votó por alguna de las opciones empatadas.
      const elegida = empatadas.find((o) => o.id === voto?.opcionId);
      if (elegida)
        return {
          categoriaId: categoria.id,
          opcion: elegida,
          metodo:
            rol === "Catador oficial"
              ? "voto del Catador Oficial"
              : "decisión del Gran Maestre",
        };
    }

    // Si ninguno de estos casos resuelve el empate, selecciona aleatoriamente. El service de votación se encarga de guardar el ganador en MongoDB.
    return {
      categoriaId: categoria.id,
      opcion: empatadas[Math.floor(Math.random() * empatadas.length)],
      metodo: "selección aleatoria",
    };
  });
}

module.exports = { obtenerPesoVoto, calcularResultados, calcularGanadores };
