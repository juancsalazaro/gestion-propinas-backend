// Importar el módulo Mongoose
const mongoose = require("mongoose");

// Definir el esquema para el registro de pago de propina
const propinaSchema = new mongoose.Schema({
  totalPropinas: {
    type: Number,
    required: true,
  },
  numPersonas: {
    type: Number,
    required: true,
  },
  propinasPorPersona: {
    type: [Number], // Array de números que representa la distribución de propinas por persona
    required: true,
  },
  metodosPago: {
    type: [{ tipo: String, monto: Number }], // Array de objetos que contiene el tipo de método de pago y el monto
    required: true,
  },
  estadoPago: {
    type: String,
    enum: ["Completo", "Incompleto"], // Estado del pago (completo o incompleto)
    required: true,
  },
});

// Crear el modelo de Propina utilizando el esquema definido
const Propina = mongoose.model("Propina", propinaSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
module.exports = Propina;
