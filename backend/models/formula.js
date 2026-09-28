const mongoose = require("mongoose");
const { CATEGORIAS } = require("../config/catalogo");

// Categorías y opciones son subdocumentos: no necesitan colecciones independientes.
const opcionSchema = new mongoose.Schema({ id: String, nombre: String, sigla: String, peso: Number, votosIniciales: Number }, { _id: false });
const categoriaSchema = new mongoose.Schema({ id: String, nombre: String, descripcion: String, opciones: [opcionSchema] }, { _id: false });
const eventoSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now }, titulo: String, detalle: String,
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
});

const formulaSchema = new mongoose.Schema({
  gremioId: { type: mongoose.Schema.Types.ObjectId, ref: "Gremio", required: true, index: true },
  creadaPorId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
  nombrePocion: { type: String, required: true, trim: true, maxlength: 50 },
  efectoDeseado: { type: String, required: true, trim: true, maxlength: 200 },
  dificultad: { type: Number, enum: [1, 2, 3, 4], required: true },
  // Nombres exactos que utiliza React. Solo los services cambian el estado.
  estado: { type: String, enum: ["proposal", "voting", "closed", "distilled"], default: "proposal" },
  fechaCierre: { type: Date, required: true },
  fechaAperturaVotacion: Date,
  fechaCierreEfectivo: Date,
  categorias: { type: [categoriaSchema], default: () => structuredClone(CATEGORIAS) },
  auditoria: [eventoSchema],
}, { timestamps: { createdAt: "fechaCreacion", updatedAt: "updatedAt" }, optimisticConcurrency: true });

// La misma propuesta del mismo autor no se crea dos veces, incluso con doble envío.
formulaSchema.index({ creadaPorId: 1, gremioId: 1, nombrePocion: 1, efectoDeseado: 1, dificultad: 1, fechaCierre: 1 }, { unique: true });
module.exports = mongoose.model("Formula", formulaSchema);
