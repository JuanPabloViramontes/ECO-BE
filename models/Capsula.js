// models/Capsula.js - USANDO COMMONJS
const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['abogadas', 'juventudes', 'cientificos'],
    default: 'abogadas'
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Capsula', capsuleSchema);