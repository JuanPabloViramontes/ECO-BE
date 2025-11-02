// models/Metric.js
const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['form_submission', 'document_download', 'user_visit'] 
  },
  data: {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSubmission' },
    documentName: String,
    page: String,
    userAgent: String,
    ip: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Metric', metricSchema);