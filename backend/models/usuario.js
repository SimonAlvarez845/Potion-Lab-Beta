const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ESPECIALIDADES } = require("../config/catalogo");

// Primer (basado en lo que hicimos en clase)

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
*/

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener mínimo 2 caracteres"],
      maxlength: [50, "El nombre debe tener máximo 50 caracteres"],
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

    // Rol general de la App
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // Especialidad del perfil, opciones vienen de catalogo.js.
    especialidad: {
      type: String,
      enum: ESPECIALIDADES,
      default: "Herbalista",
    },

    // Datos adicionales del perfil usados por la app.
    avatarUrl: { type: String, trim: true, default: "" },
    participacion: { type: Number, min: 0, max: 100, default: 100 },
    precisionCatador: { type: Number, min: 0, max: 100, default: 0 },
  },
  {
    timestamps: true,
    // Protección adicional si alguna respuesta serializa el documento directamente.
    toJSON: {
      transform(doc, resultado) {
        // Nunca se debe exponer la contraseña: ocultamos el campo interno de versión de Mongoose.
        delete resultado.password;
        delete resultado.__v;
        return resultado;
      },
    },
  },
);

// Se ejecuta automaticamente antes de guardar un usuario.
usuarioSchema.pre("save", async function () {
  // Evita volver a cifrar la contraseña cuando no fue modificada.
  if (!this.isModified("password")) return;

  // Generamos el salt y reemplazamos la contraseña original por su hash. MongoDB nunca debe almacenar la contraseña tal cual cual sin antes recibirla hasheada.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compara la contraseña ingresada con el hash almacenado y devuelve true o false. Precision: bcrypt nunca descifra la contraseña.
usuarioSchema.methods.comparePassword = async function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
