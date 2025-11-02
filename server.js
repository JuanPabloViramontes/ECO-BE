const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();


const app = express();

// Middleware
// ✅ CONFIGURACIÓN CORS COMPLETA
app.use(cors({
  origin: [
    'https://eco-admin-dashboard.netlify.app',  // Tu admin en Netlify
    'https://ecoxnuestrofuturo.mx',             // Tu sitio principal
    'http://localhost:3000',                    // Desarrollo local
    'http://localhost:5173'                     // Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Event listeners para MongoDB
mongoose.connection.on('connected', () => {
  console.log('✅ Conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión a MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Desconectado de MongoDB');
});

// Rutas - ✅ SOLO UNA FORMA DE IMPORTAR
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/metrics', require('./routes/metrics'));
app.use("/api/capsulas", require('./routes/capsulas'));
app.use("/api/workshops", require('./routes/workshops'));
app.use("/api/forms", require('./routes/forms'));

// ✅ USA ESTA FORMA DIRECTA:
app.use('/api/users', require('./routes/users'));

// Ruta de diagnóstico
app.get('/api/diagnostic', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    }[dbStatus];

    let userCount = 0;
    if (dbStatus === 1) {
      const User = require('./models/User');
      userCount = await User.countDocuments();
    }

    res.json({
      server: 'running',
      mongodb: dbStatusText,
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      server: 'running',
      mongodb: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});