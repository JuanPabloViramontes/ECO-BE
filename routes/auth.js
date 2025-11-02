const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Email:', email);
    console.log('Password recibida:', password);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Contraseña almacenada (hash):', user.password);
    
    // intenta usar el método del modelo si existe, si no usa bcrypt.compare
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }
    console.log('¿Coinciden?', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      "clave_secreta",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ✅ SOLUCIÓN: Deja que el pre-save hook haga el hash
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    const user = new User({
      email,
      password: password, // ✅ Guarda la contraseña en texto plano
      nombre,
      rol: 'admin'
    });

    await user.save(); // ✅ El pre-save hook aplicará el hash automáticamente
    res.json({ message: 'Usuario admin creado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ✅ AGREGA esta ruta TEMPORAL para resetear
router.post('/reset-and-create', async (req, res) => {
  try {
    // Elimina el usuario existente
    await User.deleteOne({ email: "nuevo@eco.com" });
    
    // Crea uno nuevo
    const user = new User({
      email: "nuevo@eco.com",
      password: "123456", // Texto plano
      nombre: "Nuevo Admin",
      rol: "admin"
    });

    await user.save();
    
    console.log('Nuevo usuario creado:', user);
    res.json({ 
      message: 'Usuario recreado correctamente',
      credenciales: {
        email: "nuevo@eco.com",
        password: "123456"
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
