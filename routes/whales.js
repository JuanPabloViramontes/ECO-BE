const express = require('express');
const multer = require('multer');
const WhaleSighting = require('../models/WhaleSighting');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Obtener todos los avistamientos
router.get('/', async (req, res) => {
  try {
    const sightings = await WhaleSighting.find().sort({ createdAt: -1 });
    res.json(sightings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Aprobar/rechazar avistamiento
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const sighting = await WhaleSighting.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(sighting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Subir imágenes de avistamiento
router.post('/upload', upload.array('images'), async (req, res) => {
  try {
    // Aquí integrarías Cloudinary o similar para subir imágenes
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;