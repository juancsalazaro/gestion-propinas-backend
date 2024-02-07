const mongoose = require("mongoose");

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
    type: [Number],
    required: true,
  },
  metodosPago: {
    type: [{ tipo: String, monto: Number }],
    required: true,
  },
  estadoPago: {
    type: String,
    enum: ["Completo", "Incompleto"],
    required: true,
  },
});

const Propina = mongoose.model("Propina", propinaSchema);

module.exports = Propina;
