// routes/users.js - SIMPLIFICADO
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v')
      .sort({ fechaCreacion: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, rol, password } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // El modelo ya se encarga del hash automáticamente
    const user = new User({
      nombre,
      email: email.toLowerCase(),
      rol: rol || 'editor',
      password // 🔹 El modelo lo hasheará automáticamente
    });

    await user.save();
    
    // No enviar el password en la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, email, rol, activo, password } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (nombre) user.nombre = nombre;
    if (email) user.email = email.toLowerCase();
    if (rol) user.rol = rol;
    if (typeof activo !== 'undefined') user.activo = activo;
    
    // Si se envía nueva contraseña, el modelo la hasheará automáticamente
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }
      user.password = password;
    }

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email ya está en uso' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;