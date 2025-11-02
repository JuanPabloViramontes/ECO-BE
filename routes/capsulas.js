// routes/capsulas.js
const express = require('express');
const Capsula = require('../models/Capsula');
const router = express.Router();

// GET /api/capsulas - Obtener todas las cápsulas
router.get("/", async (req, res) => {
  try {
    console.log('📥 Solicitando cápsulas...');
    const capsulas = await Capsula.find({ isPublic: true }).sort({ createdAt: -1 });
    console.log(`✅ Encontradas ${capsulas.length} cápsulas`);
    res.json(capsulas);
  } catch (err) {
    console.error('❌ Error obteniendo cápsulas:', err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/capsulas - Crear nueva cápsula
router.post("/", async (req, res) => {
  try {
    console.log('📤 Creando nueva cápsula:', req.body);
    
    const { title, description, videoUrl, category } = req.body;

    if (!title || !description || !videoUrl || !category) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const nuevaCapsula = new Capsula({
      title,
      description,
      videoUrl,
      category
    });
    
    const capsulaGuardada = await nuevaCapsula.save();
    console.log('✅ Cápsula creada:', capsulaGuardada._id);
    
    res.status(201).json({ 
      message: "Cápsula creada correctamente", 
      capsula: capsulaGuardada 
    });
  } catch (err) {
    console.error('❌ Error creando cápsula:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/capsulas/:id - Actualizar cápsula
router.put("/:id", async (req, res) => {
  try {
    console.log('✏️ Actualizando cápsula:', req.params.id, req.body);
    
    const { title, description, videoUrl, category } = req.body;

    const capsulaActualizada = await Capsula.findByIdAndUpdate(
      req.params.id,
      { title, description, videoUrl, category },
      { new: true, runValidators: true }
    );

    if (!capsulaActualizada) {
      return res.status(404).json({ error: "Cápsula no encontrada" });
    }

    console.log('✅ Cápsula actualizada:', capsulaActualizada._id);
    res.json({ 
      message: "Cápsula actualizada correctamente", 
      capsula: capsulaActualizada 
    });
  } catch (err) {
    console.error('❌ Error actualizando cápsula:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/capsulas/:id - Eliminar cápsula
router.delete("/:id", async (req, res) => {
  try {
    console.log('🗑️ Eliminando cápsula:', req.params.id);
    
    const capsulaEliminada = await Capsula.findByIdAndDelete(req.params.id);

    if (!capsulaEliminada) {
      return res.status(404).json({ error: "Cápsula no encontrada" });
    }

    console.log('✅ Cápsula eliminada:', req.params.id);
    res.json({ 
      message: "Cápsula eliminada correctamente",
      id: req.params.id
    });
  } catch (err) {
    console.error('❌ Error eliminando cápsula:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;