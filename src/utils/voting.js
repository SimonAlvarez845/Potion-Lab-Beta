// Calculos de votos.

// El enunciado nos dice lo siguiente:
// ingrediente ---> Herbalista
// metodo --->Runista
//frasco ---> Catador

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
// Devuelve un array de objetos
export function calcularResultados(
  categoria,
  opcionSeleccionada,
  pesoVoto = 1,
  veto = null,
) {
  const opcionesConTotales = categoria.opciones.map((opcion) => ({
    ...opcion,
    // copia las opciones y
    vetada: veto?.categoriaId === categoria.id && veto?.opcionId === opcion.id,
    totalVotos:
      opcion.votosIniciales + (opcion.id === opcionSeleccionada ? pesoVoto : 0),
  }));

  const totalGeneral = opcionesConTotales.reduce(
    (total, opcion) => total + opcion.totalVotos,
    0,
  );

  let porcentajeAcumulado = 0;

  return opcionesConTotales.map((opcion, indice) => {
    const esUltima = indice === opcionesConTotales.length - 1;
    const porcentajeCalculado =
      totalGeneral === 0
        ? 0
        : Math.round((opcion.totalVotos / totalGeneral) * 100);
    const porcentaje = esUltima
      ? Math.max(0, 100 - porcentajeAcumulado)
      : porcentajeCalculado;

    porcentajeAcumulado += porcentaje;

    return { ...opcion, porcentaje };
  });
}

function resolverEmpate(opcionesEmpatadas, formula) {
  const votoCatador = formula.desempate?.catador;
  const votoGranMaestre = formula.desempate?.granMaestre;

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

  const indiceAleatorio = Math.floor(Math.random() * opcionesEmpatadas.length);
  return {
    opcion: opcionesEmpatadas[indiceAleatorio],
    metodo: "selección aleatoria",
  };
}

export function calcularGanador(
  categoria,
  formula,
  opcionSeleccionada,
  pesoVoto,
) {
  const resultados = calcularResultados(
    categoria,
    opcionSeleccionada,
    pesoVoto,
    formula.veto,
  ).filter((opcion) => !opcion.vetada);

  const maximo = Math.max(...resultados.map((opcion) => opcion.totalVotos));
  const opcionesEmpatadas = resultados.filter(
    (opcion) => opcion.totalVotos === maximo,
  );

  if (opcionesEmpatadas.length === 1) {
    return { opcion: opcionesEmpatadas[0], metodo: "mayoría simple" };
  }

  return resolverEmpate(opcionesEmpatadas, formula);
}
