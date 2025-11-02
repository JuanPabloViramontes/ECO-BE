const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  registered: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['programado', 'en-progreso', 'completado', 'cancelado'],
    default: 'programado'
  },
  image: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: 'educacion-ambiental'
  },
  requirements: [{
    type: String
  }],
  materials: [{
    type: String
  }]
}, {
  timestamps: true
});

// Índice para búsquedas eficientes
workshopSchema.index({ title: 'text', description: 'text', instructor: 'text' });
workshopSchema.index({ date: 1 });
workshopSchema.index({ status: 1 });

module.exports = mongoose.model('Workshop', workshopSchema);