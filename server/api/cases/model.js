import mongoose from 'mongoose';

const { Schema } = mongoose;

const caseSchema = new Schema({
  date: { type: Date, default: new Date() },
  location: { type: String, required: true },
  count: { type: Number, default: 0 },
}, { collection: 'cases' });

module.exports = mongoose.model('Case', caseSchema);
