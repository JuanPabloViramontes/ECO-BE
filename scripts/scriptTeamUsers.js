// scripts/createTeamUsers.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const teamUsers = [
  {
    email: 'emilia@nuestrofuturo.mx',
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
    

    for (const userData of teamUsers) {
      try {
        const userExists = await User.findOne({ email: userData.email });
        if (userExists) {
          continue;
        }

        const user = new User(userData);
        await user.save();
      } catch (error) {
        if (error.code === 11000) {
        } else {
        }
      }
    }

    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

createTeamUsers();