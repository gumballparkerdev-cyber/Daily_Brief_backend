const mongoose = require("mongoose");

const briefSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "normal", "hard"],
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Brief", briefSchema);