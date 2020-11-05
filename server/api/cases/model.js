const mongoose = require("mongoose");

const { Schema } = mongoose;

const caseSchema = new Schema({
  date: { type: Date, default: new Date() },
  location: { type: String, required: true },
  count: { type: Number, default: 0 },
  lat: { type: Number },
  lng: { type: Number },
}, { collection: 'cases' });

module.exports = mongoose.model('Case', caseSchema);
