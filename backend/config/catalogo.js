// Especialidades del perfil; no son roles de gremio.
const ESPECIALIDADES = [
  "Herbalista",
  "Runista",
  "Catador",
  "Maestro cervecero",
];

// Las formulas copian estas opciones al crearse y sus pesos son de composición
const CATEGORIAS = [
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
        votosIniciales: 0,
      },
      {
        id: "polvo-estelar",
        nombre: "Polvo de estrellas",
        sigla: "PE",
        peso: 1.7,
        votosIniciales: 0,
      },
    ],
  },
  {
    id: "metodo",
    nombre: "Método de calentamiento",
    descripcion: "Determina la estabilidad durante la preparación.",
    opciones: [
      {
        id: "llama-azul",
        nombre: "Llama azul",
        sigla: "LA",
        peso: 1.2,
        votosIniciales: 0,
      },
      {
        id: "bano-arcano",
        nombre: "Baño de agua arcana",
        sigla: "BA",
        peso: 1.5,
        votosIniciales: 0,
      },
    ],
  },
  {
    id: "frasco",
    nombre: "Tipo de frasco",
    descripcion: "Conserva y presenta la destilación final.",
    opciones: [
      {
        id: "cristal-lunar",
        nombre: "Cristal lunar",
        sigla: "CL",
        peso: 1.1,
        votosIniciales: 0,
      },
      {
        id: "calavera-plata",
        nombre: "Calavera de plata",
        sigla: "CP",
        peso: 1.4,
        votosIniciales: 0,
      },
    ],
  },
];

// Es mas facil exportar el catalogo para reutilizar las especialidades y categorias en el resto del proyecto que tener que declararlas dos veces.
module.exports = { ESPECIALIDADES, CATEGORIAS };
