// scripts/createTeamUsers.js
const mongoose = require('mongoose');
const User = require('../models/User'); // Ajusta la ruta

const teamUsers = [
  {
    email: 'ela@nuestrofuturo.mx',
    password: 'ElaPassword2024!', // 🔹 CAMBIA ESTA CONTRASEÑA
    nombre: 'Ela',
    rol: 'admin'
  },
  {
    email: 'constanza@nuestrofuturo.mx',
    password: 'ConstanzaPassword2024!', // 🔹 CAMBIA ESTA CONTRASEÑA
    nombre: 'Constanza', 
    rol: 'admin'
  },
  {
    email: 'eco@nuestrofuturo.mx',
    password: 'EcoPassword2024!', // 🔹 CAMBIA ESTA CONTRASEÑA
    nombre: 'ECO Team',
    rol: 'editor'
  }
];

async function createTeamUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tudatabase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB...');

    for (const userData of teamUsers) {
      try {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Usuario creado: ${user.email}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Usuario ya existe: ${userData.email}`);
        } else {
          console.error(`❌ Error creando ${userData.email}:`, error.message);
        }
      }
    }

    console.log('🎉 Proceso completado!');
    
  } catch (error) {
    console.error('Error general:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

createTeamUsers();