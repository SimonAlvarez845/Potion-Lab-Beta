const mongoose = require("mongoose");

// La membresía pertenece al gremio; el mismo usuario puede tener otro rol en otro gremio.
const miembroSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    rol: {
      type: String,
      enum: [
        "Gran Maestre",
        "Alquimista sénior",
        "Catador oficial",
        "Aprendiz",
      ],
      required: true,
    },
    fechaIngreso: { type: Date, default: Date.now },
  },
  { _id: false },
);

const gremioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 50 },
    // El índice evita nombres duplicados aunque cambien las mayúsculas.
    nombreNormalizado: { type: String, required: true, unique: true },
    lema: { type: String, required: true, trim: true, maxlength: 90 },
    descripcion: { type: String, default: "", maxlength: 500 },
    tipo: { type: String, enum: ["publico", "privado"], default: "publico" },
    emblemaUrl: { type: String, default: "" },
    acento: { type: String, default: "#9b87f5" },
    codigoInvitacion: { type: String, required: true, unique: true },
    creadoPorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    miembros: [miembroSchema],
  },
  {
    timestamps: true,
    // Dos administradores no pueden guardar cambios sobre una misma versión antigua.
    optimisticConcurrency: true,
  },
);

module.exports = mongoose.model("Gremio", gremioSchema);
