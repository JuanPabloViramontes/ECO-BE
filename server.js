const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// ✅ Middleware CORS (más robusto)
const allowedOrigins = [
  'https://eco-admin-dashboard.netlify.app',  // Tu admin en Netlify
  'https://ecoxnuestrofuturo.mx',             // Tu sitio principal
  'http://localhost:3000',                    // Local dev
  'http://localhost:5173',                    // Vite dev server
  'http://localhost:8080',
   'http://localhost:8081',
  'https://eco-be.onrender.com'                 
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // ✅ Responder manualmente las peticiones preflight (Render necesita esto)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Middleware JSON y estáticos
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
});

mongoose.connection.on('error', (err) => {
});

mongoose.connection.on('disconnected', () => {
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/capsulas', require('./routes/capsulas'));
app.use('/api/workshops', require('./routes/workshops'));
app.use('/api/forms', require('./routes/forms'));
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

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
});
