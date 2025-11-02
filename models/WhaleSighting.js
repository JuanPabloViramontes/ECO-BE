const mongoose = require('mongoose');

const whaleSightingSchema = new mongoose.Schema({
  location: { type: String, required: true },
  date: { type: Date, required: true },
  species: { type: String, required: true },
  images: [{ type: String }], // URLs de imágenes
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WhaleSighting', whaleSightingSchema);