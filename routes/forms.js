const express = require('express');
const FormSubmission = require('../models/FormSubmission');
const Metric = require('../models/metric.js');
const router = express.Router();

// Obtener todos los formularios (solo admin)
router.get('/', async (req, res) => {
  try {
    const forms = await FormSubmission.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Eliminar un formulario
router.delete('/:id', async (req, res) => {
  try {
    await FormSubmission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Formulario eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un formulario (público) - CON MÉTRICA
router.post('/', async (req, res) => {
  // 🔹 ACEPTAR AMBAS VERSIONES (español e inglés)
  const { nombre, correo, propuesta, name, email, message } = req.body;

  // Usar los campos en español o inglés
  const finalName = nombre || name;
  const finalEmail = correo || email;
  const finalMessage = propuesta || message;

  if (!finalName || !finalEmail || !finalMessage) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    const newForm = new FormSubmission({
      name: finalName,
      email: finalEmail,
      message: finalMessage
    });

    const savedForm = await newForm.save();
    
    // ✅ REGISTRAR MÉTRICA del formulario
    const metric = new Metric({
      type: 'form_submission',
      data: {
        formId: savedForm._id
      }
    });
    await metric.save();

    res.status(201).json(savedForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;