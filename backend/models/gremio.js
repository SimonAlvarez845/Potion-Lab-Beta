const mongoose = require("mongoose");

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
*/

// La membresía pertenece al gremio. Un mismo usuario puede tener otro rol en otro gremio.
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
    fechaNombramientoCatador: Date,
  },
  { _id: false },
  // Evite que Mongoose genere un _id adicional para cada miembro dentro del array.
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
  },
);

module.exports = mongoose.model("Gremio", gremioSchema);
