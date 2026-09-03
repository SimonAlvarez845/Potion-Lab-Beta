/* Data Seeder variado generado con ayuda de IA. 
   Es la base de datos fake que vamos a usar como motor inicial de la App 
   Todo lleva export porque vamos a usar las ctes desde otros archivos*/

export const ESPECIALIDADES = [
  "Herbalista",
  "Runista",
  "Catador",
  "Maestro cervecero",
];

export const ESTADOS_FORMULA = {
  proposal: { etiqueta: "Propuesta", tono: "slate" },
  voting: { etiqueta: "Votación abierta", tono: "cyan" },
  closed: { etiqueta: "Cerrada", tono: "amber" },
  distilled: { etiqueta: "Destilada", tono: "violet" },
};

export const USUARIOS_DEMO = [
  {
    id: "u1",
    nombreCompleto: "Simón Alvarez",
    email: "simon@potionlab.edu",
    especialidad: "Herbalista",
    avatarUrl: "",
    puntos: 180,
    rarezaTotal: 426,
    precisionCatador: 72,
    participacion: 88,
  },
  {
    id: "u2",
    nombreCompleto: "Nyra Solverde",
    email: "nyra@potionlab.edu",
    especialidad: "Maestro cervecero",
    avatarUrl: "",
    puntos: 240,
    rarezaTotal: 580,
    precisionCatador: 84,
    participacion: 96,
  },
  {
    id: "u3",
    nombreCompleto: "Lyrion Vale",
    email: "lyrion@potionlab.edu",
    especialidad: "Runista",
    avatarUrl: "",
    puntos: 215,
    rarezaTotal: 512,
    precisionCatador: 68,
    participacion: 92,
  },
  {
    id: "u4",
    nombreCompleto: "David Botero",
    email: "debotero@eia.edu",
    especialidad: "Catador",
    avatarUrl: "",
    puntos: 205,
    rarezaTotal: 498,
    precisionCatador: 94,
    participacion: 90,
  },
  {
    id: "u5",
    nombreCompleto: "Mara Verdoluz",
    email: "mara@potionlab.edu",
    especialidad: "Herbalista",
    avatarUrl: "",
    puntos: 130,
    rarezaTotal: 301,
    precisionCatador: 60,
    participacion: 76,
  },
  {
    id: "u6",
    nombreCompleto: "Orion Tallaruna",
    email: "orion@potionlab.edu",
    especialidad: "Runista",
    avatarUrl: "",
    puntos: 155,
    rarezaTotal: 344,
    precisionCatador: 64,
    participacion: 81,
  },
  {
    id: "u7",
    nombreCompleto: "Selene Brumaria",
    email: "selene@potionlab.edu",
    especialidad: "Catador",
    avatarUrl: "",
    puntos: 192,
    rarezaTotal: 453,
    precisionCatador: 89,
    participacion: 93,
  },
  {
    id: "u8",
    nombreCompleto: "Darian Caldero",
    email: "darian@potionlab.edu",
    especialidad: "Maestro cervecero",
    avatarUrl: "",
    puntos: 170,
    rarezaTotal: 399,
    precisionCatador: 75,
    participacion: 85,
  },
  {
    id: "u9",
    nombreCompleto: "Iria Musgoluna",
    email: "iria@potionlab.edu",
    especialidad: "Herbalista",
    avatarUrl: "",
    puntos: 118,
    rarezaTotal: 278,
    precisionCatador: 58,
    participacion: 69,
  },
  {
    id: "u10",
    nombreCompleto: "Eiden Glifoscuro",
    email: "eiden@potionlab.edu",
    especialidad: "Runista",
    avatarUrl: "",
    puntos: 148,
    rarezaTotal: 332,
    precisionCatador: 70,
    participacion: 79,
  },
  {
    id: "u11",
    nombreCompleto: "Vera Argentum",
    email: "vera@potionlab.edu",
    especialidad: "Catador",
    avatarUrl: "",
    puntos: 102,
    rarezaTotal: 244,
    precisionCatador: 82,
    participacion: 64,
  },
  {
    id: "u12",
    nombreCompleto: "Nilo Espinaverde",
    email: "nilo@potionlab.edu",
    especialidad: "Herbalista",
    avatarUrl: "",
    puntos: 74,
    rarezaTotal: 182,
    precisionCatador: 49,
    participacion: 24,
  },
];

export const CUENTAS_DEMO = [
  {
    email: "simon@potionlab.edu",
    password: "pocion123",
    usuarioId: "u1",
    etiqueta: "Grand Master",
  },
  {
    email: "debotero@eia.edu",
    password: "catador123",
    usuarioId: "u4",
    etiqueta: "Catador Oficial",
  },
];

/* Una pequeña factory function auxiliar para hacer mas facil la declaracion de miembro()
   se usa dentro de gremios para no tener que escribir tanto
*/
function miembro(usuarioId, rol, fechaIngreso) {
  return { usuarioId, rol, fechaIngreso };
}

export const GREMIOS_INICIALES = [
  {
    id: "g1",
    nombre: "Orden del Eclipse",
    lema: "Toda gran fórmula comienza con una duda.",
    tipo: "publico",
    codigoInvitacion: "ECLIP6",
    emblemaUrl: "",
    acento: "#9b87f5",
    descripcion:
      "Un gremio que combina botánica nocturna, runas y métodos de destilación astral.",
    miembros: [
      miembro("u1", "Gran Maestre", "2026-02-12"),
      miembro("u3", "Alquimista sénior", "2026-02-20"),
      miembro("u4", "Catador oficial", "2026-03-01"),
      miembro("u5", "Aprendiz", "2026-04-14"),
      miembro("u6", "Aprendiz", "2026-05-08"),
    ],
  },
  {
    id: "g2",
    nombre: "Círculo Boreal",
    lema: "La precisión también puede ser magia.",
    tipo: "publico",
    codigoInvitacion: "BOREA6",
    emblemaUrl: "",
    acento: "#55d9e8",
    descripcion:
      "Alquimistas especializados en cristales fríos, agua arcana y conservación.",
    miembros: [
      miembro("u2", "Gran Maestre", "2026-01-30"),
      miembro("u7", "Catador oficial", "2026-02-16"),
      miembro("u8", "Alquimista sénior", "2026-03-11"),
      miembro("u9", "Aprendiz", "2026-06-02"),
    ],
  },
  {
    id: "g3",
    nombre: "Cámara Umbría",
    lema: "Lo oculto se revela gota a gota.",
    tipo: "privado",
    codigoInvitacion: "UMBRA6",
    emblemaUrl: "",
    acento: "#f4c96b",
    descripcion:
      "Círculo privado dedicado a fórmulas arcanas y desempates rituales.",
    miembros: [
      miembro("u10", "Gran Maestre", "2026-01-18"),
      miembro("u11", "Catador oficial", "2026-02-24"),
      miembro("u12", "Alquimista sénior", "2026-03-09"),
      miembro("u1", "Aprendiz", "2026-07-19"),
    ],
  },
];

const DEFINICION_CATEGORIAS = [
  {
    id: "ingrediente",
    nombre: "Ingrediente base",
    descripcion: "Define el carácter principal de la poción.",
    opciones: [
      {
        id: "mandragora",
        nombre: "Raíz de mandrágora",
        sigla: "RM",
        peso: 1.3,
      },
      {
        id: "polvo-estelar",
        nombre: "Polvo de estrellas",
        sigla: "PE",
        peso: 1.7,
      },
    ],
  },
  {
    id: "metodo",
    nombre: "Método de calentamiento",
    descripcion: "Determina la estabilidad durante la preparación.",
    opciones: [
      { id: "llama-azul", nombre: "Llama azul", sigla: "LA", peso: 1.2 },
      {
        id: "bano-arcano",
        nombre: "Baño de agua arcana",
        sigla: "BA",
        peso: 1.5,
      },
    ],
  },
  {
    id: "frasco",
    nombre: "Tipo de frasco",
    descripcion: "Conserva y presenta la destilación final.",
    opciones: [
      { id: "cristal-lunar", nombre: "Cristal lunar", sigla: "CL", peso: 1.1 },
      {
        id: "calavera-plata",
        nombre: "Calavera de plata",
        sigla: "CP",
        peso: 1.4,
      },
    ],
  },
];

/* Cada fila es una categoria, cada columna es una opcion, se le da un valor por defecto para que si no ingresa nada automaticamente ponga un 0 */

/* Los maps copian la categoria y reemplazan las opciones para que ademas tengan votos, agrega esos votos iniciales solo si encuentra la categoria, y para manejo de los nulls los cambia por un 0 */

export function crearCategorias(
  votos = [
    [0, 0],
    [0, 0],
    [0, 0],
  ],
) {
  return DEFINICION_CATEGORIAS.map((categoria, indiceCategoria) => ({
    ...categoria,
    opciones: categoria.opciones.map((opcion, indiceOpcion) => ({
      ...opcion,
      votosIniciales: votos[indiceCategoria]?.[indiceOpcion] ?? 0,
    })),
  }));
}

export const FORMULAS_INICIALES = [
  {
    id: "f1",
    gremioId: "g1",
    nombrePocion: "Bruma del Caminante",
    efectoDeseado: "Reducir el cansancio durante una expedición nocturna.",
    dificultad: 2,
    estado: "proposal",
    creadaPorId: "u3",
    fechaCreacion: "2026-08-26T13:00:00Z",
    fechaCierre: "2026-09-02T23:59:00Z",
    categorias: crearCategorias(),
    veto: null,
  },
  {
    id: "f2",
    gremioId: "g2",
    nombrePocion: "Memoria de Escarcha",
    efectoDeseado:
      "Conservar un recuerdo con absoluta claridad por una semana.",
    dificultad: 3,
    estado: "proposal",
    creadaPorId: "u8",
    fechaCreacion: "2026-08-27T09:30:00Z",
    fechaCierre: "2026-09-03T18:00:00Z",
    categorias: crearCategorias(),
    veto: null,
  },
  {
    id: "f3",
    gremioId: "g1",
    nombrePocion: "Elixir del Eclipse",
    efectoDeseado: "Agudizar los sentidos durante la noche sin causar fatiga.",
    dificultad: 2,
    estado: "voting",
    creadaPorId: "u3",
    fechaCreacion: "2026-08-24T14:00:00Z",
    fechaCierre: "2026-09-01T22:00:00Z",
    categorias: crearCategorias([
      [3, 2],
      [2, 3],
      [2, 3],
    ]),
    desempate: { catador: "polvo-estelar", granMaestre: "mandragora" },
    veto: null,
  },
  {
    id: "f4",
    gremioId: "g2",
    nombrePocion: "Pulso Boreal",
    efectoDeseado: "Mantener las manos firmes en ambientes de frío extremo.",
    dificultad: 3,
    estado: "voting",
    creadaPorId: "u8",
    fechaCreacion: "2026-08-23T12:00:00Z",
    fechaCierre: "2026-08-31T20:00:00Z",
    categorias: crearCategorias([
      [2, 2],
      [1, 3],
      [2, 2],
    ]),
    desempate: { catador: "cristal-lunar", granMaestre: "polvo-estelar" },
    veto: null,
  },
  {
    id: "f5",
    gremioId: "g3",
    nombrePocion: "Tinta de los Susurros",
    efectoDeseado:
      "Revelar durante un minuto palabras escritas con tinta invisible.",
    dificultad: 4,
    estado: "voting",
    creadaPorId: "u12",
    fechaCreacion: "2026-08-22T18:00:00Z",
    fechaCierre: "2026-09-01T23:30:00Z",
    categorias: crearCategorias([
      [1, 2],
      [1, 2],
      [1, 2],
    ]),
    desempate: { catador: "bano-arcano", granMaestre: "llama-azul" },
    veto: null,
  },
  {
    id: "f6",
    gremioId: "g1",
    nombrePocion: "Lumbre Serena",
    efectoDeseado: "Producir una luz suave que no atraiga criaturas nocturnas.",
    dificultad: 2,
    estado: "closed",
    creadaPorId: "u1",
    fechaCreacion: "2026-08-17T11:00:00Z",
    fechaCierre: "2026-08-24T11:00:00Z",
    categorias: crearCategorias([
      [2, 1],
      [2, 1],
      [2, 1],
    ]),
    desempate: { catador: "mandragora", granMaestre: "llama-azul" },
    veto: null,
  },
  {
    id: "f7",
    gremioId: "g2",
    nombrePocion: "Velo de Aurora",
    efectoDeseado: "Crear un brillo protector visible únicamente al amanecer.",
    dificultad: 3,
    estado: "closed",
    creadaPorId: "u2",
    fechaCreacion: "2026-08-15T16:00:00Z",
    fechaCierre: "2026-08-22T16:00:00Z",
    categorias: crearCategorias(),
    desempate: { catador: "cristal-lunar", granMaestre: "polvo-estelar" },
    veto: null,
  },
  {
    id: "f8",
    gremioId: "g1",
    nombrePocion: "Rocío de Medianoche",
    efectoDeseado:
      "Recuperar la vitalidad de plantas expuestas a calor intenso.",
    dificultad: 2,
    estado: "distilled",
    creadaPorId: "u5",
    fechaCreacion: "2026-07-18T12:00:00Z",
    fechaCierre: "2026-07-25T12:00:00Z",
    categorias: crearCategorias(),
    veto: null,
    resultadoId: "p1",
  },
  {
    id: "f9",
    gremioId: "g2",
    nombrePocion: "Cristal de Calma",
    efectoDeseado: "Disminuir la ansiedad antes de una prueba de alquimia.",
    dificultad: 1,
    estado: "distilled",
    creadaPorId: "u7",
    fechaCreacion: "2026-07-09T10:00:00Z",
    fechaCierre: "2026-07-16T10:00:00Z",
    categorias: crearCategorias(),
    veto: null,
    resultadoId: "p2",
  },
  {
    id: "f10",
    gremioId: "g3",
    nombrePocion: "Eco Rúnico",
    efectoDeseado: "Repetir una frase pronunciada junto a una runa activada.",
    dificultad: 4,
    estado: "distilled",
    creadaPorId: "u10",
    fechaCreacion: "2026-06-21T21:00:00Z",
    fechaCierre: "2026-06-28T21:00:00Z",
    categorias: crearCategorias(),
    veto: null,
    resultadoId: "p3",
  },
];

export const GRIMORIO_INICIAL = [
  {
    id: "p1",
    formulaId: "f8",
    gremioId: "g1",
    nombre: "Raíz de mandrágora + Baño de agua arcana en Cristal lunar",
    efecto: "Recuperar la vitalidad de plantas expuestas a calor intenso.",
    dificultadReal: 4.8,
    rareza: 49,
    fechaDestilacion: "2026-07-25T12:15:00Z",
  },
  {
    id: "p2",
    formulaId: "f9",
    gremioId: "g2",
    nombre: "Polvo de estrellas + Baño de agua arcana en Cristal lunar",
    efecto: "Disminuir la ansiedad antes de una prueba de alquimia.",
    dificultadReal: 4.2,
    rareza: 50,
    fechaDestilacion: "2026-07-16T10:08:00Z",
  },
  {
    id: "p3",
    formulaId: "f10",
    gremioId: "g3",
    nombre: "Polvo de estrellas + Llama azul en Calavera de plata",
    efecto: "Repetir una frase pronunciada junto a una runa activada.",
    dificultadReal: 6.9,
    rareza: 75,
    fechaDestilacion: "2026-06-28T21:04:00Z",
  },
];

export const AUDITORIA_INICIAL = [
  {
    id: "a1",
    formulaId: "f3",
    fecha: "2026-08-24T14:08:00Z",
    titulo: "Votación abierta",
    detalle: "Lyrion Vale abrió la fórmula a votación.",
  },
  {
    id: "a2",
    formulaId: "f4",
    fecha: "2026-08-23T12:15:00Z",
    titulo: "Votación abierta",
    detalle: "Darian Caldero abrió la fórmula a votación.",
  },
  {
    id: "a3",
    formulaId: "f6",
    fecha: "2026-08-24T11:01:00Z",
    titulo: "Votación cerrada",
    detalle: "La fecha límite fue alcanzada y la votación se cerró.",
  },
  {
    id: "a4",
    formulaId: "f8",
    fecha: "2026-07-25T12:15:00Z",
    titulo: "Poción destilada",
    detalle: "El resultado fue almacenado permanentemente en el grimorio.",
  },
  {
    id: "a5",
    formulaId: "f4",
    fecha: "2026-08-25T17:40:00Z",
    titulo: "Empate detectado",
    detalle: "El voto del Catador Oficial será usado como primer desempate.",
  },
];
