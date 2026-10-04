const mongoose = require("mongoose");
const { CATEGORIAS } = require("../config/catalogo");

/* TABLA DE MONGOOSE
 required: hace obligatorio un campo.
 unique: crea un índice para impedir valores repetidos.
 select: false: excluye el campo de las consultas por defecto.
 enum: limita el valor a una lista de opciones permitidas.
 default: establece un valor inicial si no se proporciona uno.
 min / max: establecen los límites permitidos para un número.
 pre("save"): ejecuta una acción antes de guardar el documento.
 comparePassword(): permite comprobar la contraseña durante el inicio de sesión.
 timestamps: crea automáticamente createdAt y updatedAt.
 ref: indica a que modelo pertenece el ObjectId que estoy guardando.
 index: crea un índice secundario que hace que las querys sean mas rapidas
*/

// Guardamos las categorías y sus opciones dentro de la fórmula, sin crear colecciones aparte.
const opcionSchema = new mongoose.Schema(
  {
    id: String,
    nombre: String,
    sigla: String,
    peso: Number,
    votosIniciales: Number,
  },
  { _id: false },
);

const categoriaSchema = new mongoose.Schema(
  {
    id: String,
    nombre: String,
    descripcion: String,
    opciones: [opcionSchema],
  },
  { _id: false },
);

// Guardamos los cambios importantes de la fórmula y el usuario que los realizó.
const eventoSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  titulo: String,
  detalle: String,
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
});

// Cada usuario ocupa una posición por categoría. Se conserva el peso emitido, no el rol futuro.
const votoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    categoriaId: String,
    opcionId: String,
    peso: Number,
    dificultad: { type: Number, min: 1, max: 4 },
    esCatador: Boolean,
    fechaPrimerVoto: Date,
    fecha: Date,
  },
  { _id: false },
);

const vetoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    categoriaId: String,
    opcionId: String,
    fecha: Date,
  },
  { _id: false },
);

// Guardar el ganador evita repetir el azar al consultar una formula cerrada.
const ganadorSchema = new mongoose.Schema(
  {
    categoriaId: String,
    opcion: opcionSchema,
    metodo: String,
  },
  { _id: false },
);

const formulaSchema = new mongoose.Schema(
  {
    gremioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gremio",
      required: true,
      index: true,
    },

    creadaPorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },

    nombrePocion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    efectoDeseado: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    dificultad: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },

    // Usamos los mismos estados que maneja React.
    estado: {
      type: String,
      enum: ["proposal", "voting", "closed", "distilled"],
      default: "proposal",
    },

    fechaCierre: { type: Date, required: true },
    fechaAperturaVotacion: Date,
    fechaCierreEfectivo: Date,
    participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
    catadorId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    fechaInicioCatador: Date,
    fechaNombramientoCatador: Date,
    catadorEvaluado: { type: Boolean, default: false },
    sancionCatadorPendiente: { type: Boolean, default: false },

    // Guardamos el resultado de la destilación dentro de la formula, sin crear otro modelo.
    pocion: {
      type: new mongoose.Schema(
        {
          nombre: String,
          efecto: String,
          dificultadReal: Number,
          rareza: Number,
          fechaDestilacion: Date,
          decisiones: [
            { categoriaId: String, opcion: String, metodo: String, _id: false },
          ],
        },
        { _id: false },
      ),
      default: null,
    },

    // Cada fórmula recibe su propia copia de las categorías del catálogo. default las agrega y structuredClone evita modificar el catalogo original (esto lo busque).
    categorias: {
      type: [categoriaSchema],
      default: () => structuredClone(CATEGORIAS),
    },

    // Guardamos los demas datos de interes de una formula
    votos: [votoSchema],
    veto: { type: vetoSchema, default: null },
    ganadores: [ganadorSchema],
    auditoria: [eventoSchema],
  },
  {
    timestamps: {
      createdAt: "fechaCreacion",
      updatedAt: "updatedAt",
    },
  },
);

// Creamos un indice para evitar guardar dupes de propuestas. MongoDB compara los seis campos juntos, no cada uno por separado. El 1 indica que los quiero en orden ascendente (esto lo busque)
formulaSchema.index(
  {
    creadaPorId: 1,
    gremioId: 1,
    nombrePocion: 1,
    efectoDeseado: 1,
    dificultad: 1,
    fechaCierre: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("Formula", formulaSchema);
