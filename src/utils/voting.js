// Calculos de votos dados por el enunciado
const ESPECIALIDAD_POR_CATEGORIA = {
  ingrediente: "Herbalista",
  metodo: "Runista",
  frasco: "Catador",
};

// Ademas, todo voto especializado vale:
const PESO_ESPECIALISTA = 1.2;

// Calcula cuanto vale el voto del usuario en una categoria.
// Por defecto: si no hay catadorOficial ponlo false de una vez
// Devuelve un numero
export function obtenerPesoVoto(usuario, categoriaId, catadorOficial = false) {
  let peso = 1;

  const esMaestroCervecero = usuario.especialidad === "Maestro cervecero";

  const esEspecialistaCategoria =
    ESPECIALIDAD_POR_CATEGORIA[categoriaId] === usuario.especialidad;

  if (esMaestroCervecero || esEspecialistaCategoria) {
    peso = PESO_ESPECIALISTA;
  }

  // El Catador Oficial tiene voto doble en todas las categorias.
  return catadorOficial ? peso * 2 : peso;
}

// Calcula votos totales y porcentajes de cada opcion.
// votosFormula contiene los votos de todos los usuarios de una formula.
export function calcularResultados(categoria, votosFormula = {}, veto = null) {
  const opcionesConTotales = categoria.opciones.map((opcion) => {
    // Cada opcion empieza con los votos de prueba que ya traia el seed.
    let totalVotos = opcion.votosIniciales;

    // Recorremos los votos de todos los usuarios de la formula.
    Object.values(votosFormula).forEach((votosUsuario) => {
      // Busca el voto de ese usuario para esta categoria.
      const voto = votosUsuario[categoria.id];

      // Si voto por esta opcion, sumamos el peso que tenia su voto.
      if (voto?.opcionId === opcion.id) {
        totalVotos += voto.peso;
      }
    });

    return {
      ...opcion,

      // Una opcion esta vetada si coincide categoria y opcion.
      vetada:
        veto?.categoriaId === categoria.id && veto?.opcionId === opcion.id,

      totalVotos,
    };
  });

  // Para los porcentajes no contamos las opciones vetadas.
  const totalGeneral = opcionesConTotales
    .filter((opcion) => !opcion.vetada)
    .reduce((total, opcion) => total + opcion.totalVotos, 0);

  return opcionesConTotales.map((opcion) => {
    const porcentaje =
      opcion.vetada || totalGeneral === 0
        ? 0
        : Math.round((opcion.totalVotos / totalGeneral) * 100);

    return {
      ...opcion,
      porcentaje,
    };
  });
}

// Resuelve un empate siguiendo el orden del enunciado:
// Catador Oficial -> Gran Maestre -> azar.
function resolverEmpate(opcionesEmpatadas, categoriaId, gremio, votosFormula) {
  // Busca los roles
  const catador = gremio?.miembros.find(
    (miembro) => miembro.rol === "Catador oficial",
  );
  const granMaestre = gremio?.miembros.find(
    (miembro) => miembro.rol === "Gran Maestre",
  );

  // busca el voto de cada uno
  const votoCatador =
    votosFormula?.[catador?.usuarioId]?.[categoriaId]?.opcionId;
  const votoGranMaestre =
    votosFormula?.[granMaestre?.usuarioId]?.[categoriaId]?.opcionId;

  // lo resuelve en ese orden (solo si el Catador no sirve, mira el Gran Maestre)
  if (opcionesEmpatadas.some((opcion) => opcion.id === votoCatador)) {
    return {
      opcion: opcionesEmpatadas.find((opcion) => opcion.id === votoCatador),
      metodo: "voto del Catador Oficial",
    };
  }

  if (opcionesEmpatadas.some((opcion) => opcion.id === votoGranMaestre)) {
    return {
      opcion: opcionesEmpatadas.find((opcion) => opcion.id === votoGranMaestre),
      metodo: "decisión del Gran Maestre",
    };
  }

  // si ambos fallan lo deja a la suerte
  const indiceAleatorio = Math.floor(Math.random() * opcionesEmpatadas.length);

  return {
    opcion: opcionesEmpatadas[indiceAleatorio],
    metodo: "selección aleatoria",
  };
}

// Calcula cual opcion gana dentro de una categoria.
export function calcularGanador(categoria, formula, votosFormula, gremio) {
  const resultados = calcularResultados(
    categoria,
    votosFormula,
    formula.veto,
  ).filter((opcion) => !opcion.vetada);

  // Seleccione el mayor
  const maximo = Math.max(...resultados.map((opcion) => opcion.totalVotos));

  // Detecte el empate
  const opcionesEmpatadas = resultados.filter(
    (opcion) => opcion.totalVotos === maximo,
  );

  // Si solo es una se resuelve por mayoria simple
  if (opcionesEmpatadas.length === 1) {
    return {
      opcion: opcionesEmpatadas[0],
      metodo: "mayoría simple",
    };
  }

  return resolverEmpate(opcionesEmpatadas, categoria.id, gremio, votosFormula);
}
