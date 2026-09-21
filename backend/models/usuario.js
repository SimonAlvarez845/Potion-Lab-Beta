const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Primer (basado en lo que hicimos en clase)

/** A tener en cuenta:
  required: evita guardar campos vacios
  unique crea un índice para impedir correos repetidos
  select: false evita que la contraseña se devuelva en queries
  pre("save"): cifra la contraseña antes de almacenarla
  comparePassword(): permite comprobar la contraseña durante el inicio de sesión
  timestamps: crea automáticamente un valor para createdAt y updatedAt.
*/

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El email no es válido"],
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener mínimo 6 caracteres"],
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// Se ejecuta automáticamente antes de guardar un usuario.
usuarioSchema.pre("save", async function () {
  // Evita volver a cifrar la contraseña cuando no fue modificada.
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compara la contraseña ingresada con la contraseña cifrada.
usuarioSchema.methods.comparePassword = async function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
