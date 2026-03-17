// models/Metric.js
const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['form_submission', 'document_download', 'user_visit', 'letters_count'] // 👈 AGREGADO
  },
  data: {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSubmission' },
    documentName: String,
    page: String,
    userAgent: String,
    ip: String,
    count: Number // 👈 AGREGADO para guardar el número de cartas
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now } // 👈 AGREGADO opcional
});

module.exports = mongoose.model('Metric', metricSchema);