// scripts/createTeamUsers.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const teamUsers = [
  {
    email: 'ela@nuestrofuturo.mx',
    password: 'nuestroeco135',
    nombre: 'Ela',
    rol: 'admin'
  },
  {
    email: 'constanza@nuestrofuturo.mx',
    password: 'nuestroeco246!',
    nombre: 'Constanza', 
    rol: 'admin'
  },
];

async function createTeamUsers() {
  try {
    // ✅ Conexión con opciones SSL
    await mongoose.connect(process.env.MONGODB_URI, {
      // Elimina estas líneas obsoletas:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      
      // Agrega estas opciones SSL:
      ssl: true,
      tlsAllowInvalidCertificates: false,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('📡 Conectado a MongoDB Atlas...');

    for (const userData of teamUsers) {
      try {
        const userExists = await User.findOne({ email: userData.email });
        if (userExists) {
          console.log(`⚠️ Usuario ya existe: ${userData.email}`);
          continue;
        }

        const user = new User(userData);
        await user.save();
        console.log(`✅ Usuario creado: ${userData.email}`);
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
    console.error('❌ Error general:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createTeamUsers();