// routes/metrics.js - NUEVO ARCHIVO
const express = require('express');
const Metric = require('../models/metric.js');
const FormSubmission = require('../models/FormSubmission');
const router = express.Router();

// Obtener estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Contar formularios por período
    const totalForms = await FormSubmission.countDocuments();
    const todayForms = await FormSubmission.countDocuments({ 
      createdAt: { $gte: startOfToday } 
    });
    const weekForms = await FormSubmission.countDocuments({ 
      createdAt: { $gte: startOfWeek } 
    });
    const monthForms = await FormSubmission.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    // Formularios últimos 7 días (para gráfico)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await FormSubmission.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      
      last7Days.push({
        date: start.toLocaleDateString('es-MX'),
        count
      });
    }

    res.json({
      totals: {
        total: totalForms,
        today: todayForms,
        week: weekForms,
        month: monthForms
      },
      last7Days
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// routes/metrics.js - ENDPOINT CORREGIDO CON DATOS REALES
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.setDate(now.getDate() - 7));

    // VISITAS - de métricas (esto SÍ funciona)
    const totalVisits = await Metric.countDocuments({ type: 'user_visit' });
    const last7Visits = await Metric.countDocuments({ 
      type: 'user_visit', 
      createdAt: { $gte: last7Days } 
    });
    // En el endpoint /overview, modifica cómo lees lettersCount
const lettersMetric = await Metric.findOne({ type: 'letters_count' });
const lettersCount = lettersMetric?.data?.count || 0; // 👈 Ahora lee data.count

    // FORMULARIOS - usar las métricas ya que FormSubmission está vacío
    const formsFromMetrics = await Metric.countDocuments({ type: 'form_submission' });
    const formsFromCollection = await FormSubmission.countDocuments();
    
    // Usar el que tenga datos (métricas tienen 2, colección tiene 0)
    const totalForms = formsFromCollection > 0 ? formsFromCollection : formsFromMetrics;

    // DESCARGAS - de métricas (actualmente 0)
    const totalDownloads = await Metric.countDocuments({ type: 'document_download' });

    // TOP LOCATION
    const topLocationAgg = await Metric.aggregate([
      { $match: { type: 'user_visit', 'data.ip': { $exists: true, $ne: null } } },
      { $group: { _id: '$data.ip', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    const topLocation = topLocationAgg.length > 0 
      ? `IP: ${topLocationAgg[0]._id}` 
      : 'Sin datos';


   res.json({
  visits: { 
    total: totalVisits || 0, 
    last7: last7Visits || 0 
  },
  forms: totalForms || 0,
  downloads: totalDownloads || 0,
  topLocation: topLocation,
  lettersCount: lettersCount   // 👈 AGREGAR ESTO
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/track', async (req, res) => {
  try {
    const metric = new Metric(req.body);
    await metric.save();
    res.status(201).json({ message: 'Metric registrada' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// routes/metrics.js - ENDPOINT CORREGIDO
router.post('/set-letters-count', async (req, res) => {
  try {
    const { count } = req.body;
    
    // Convertir a número si viene como string
    const countNumber = Number(count);
    
    // Validación más flexible
    if (isNaN(countNumber)) {
      return res.status(400).json({ 
        success: false,
        message: 'Count debe ser un número válido' 
      });
    }

    // Buscar si ya existe
    let lettersMetric = await Metric.findOne({ type: 'letters_count' });

    if (lettersMetric) {
      // 👇 IMPORTANTE: Guardar en data.count, no data = { count }
      lettersMetric.data.count = countNumber;
      lettersMetric.updatedAt = new Date();
      await lettersMetric.save();
    } else {
      lettersMetric = new Metric({
        type: 'letters_count',
        data: { 
          count: countNumber  // 👈 Guardar como propiedad de data
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await lettersMetric.save();
    }

    res.json({ 
      success: true, 
      count: countNumber,
      message: 'Contador guardado correctamente'
    });
  } catch (err) {
    console.error('❌ Error en set-letters-count:', err);
    res.status(500).json({ 
      success: false,
      message: err.message
    });
  }
});
// routes/metrics.js - AGREGAR ESTE ENDPOINT DE DIAGNÓSTICO
router.get('/debug-letters', async (req, res) => {
  try {
    const lettersMetric = await Metric.findOne({ type: 'letters_count' });
    
    res.json({
      exists: !!lettersMetric,
      lettersMetric: lettersMetric ? {
        id: lettersMetric._id,
        type: lettersMetric.type,
        data: lettersMetric.data,
        createdAt: lettersMetric.createdAt,
        updatedAt: lettersMetric.updatedAt
      } : null,
      allMetricsByType: await Metric.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// routes/metrics.js - AGREGAR ESTO
router.get('/check-forms', async (req, res) => {
  try {
    // Verificar si la colección existe y tiene documentos
    const forms = await FormSubmission.find().limit(5);
    const formCount = await FormSubmission.countDocuments();
    
    // Verificar estructura del modelo
    const formSample = forms.length > 0 ? forms[0] : null;
    
    res.json({
      formCount,
      formsSample: formSample,
      formsCollectionExists: formCount > 0,
      message: formCount === 0 ? 'La colección FormSubmission está vacía' : 'Formularios encontrados'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error accediendo a FormSubmission',
      error: err.message 
    });
  }
});
// routes/metrics.js - AGREGAR ESTE ENDPOINT
router.post('/track-download', async (req, res) => {
  try {
    const { documentName, category } = req.body;
    
    
    const metric = new Metric({
      type: 'document_download',
      data: {
        documentName: documentName || 'documento-desconocido',
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      }
    });
    
    await metric.save();
    
    res.json({ 
      success: true, 
      message: 'Descarga registrada',
      id: metric._id 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});
// routes/metrics.js - AGREGAR ESTE ENDPOINT DE DIAGNÓSTICO
router.get('/debug-downloads', async (req, res) => {
  try {
    const downloadMetrics = await Metric.find({ type: 'document_download' });
    const downloadCount = await Metric.countDocuments({ type: 'document_download' });
    
    const allMetricsByType = await Metric.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      downloadCount,
      downloadMetrics: downloadMetrics.map(m => ({
        id: m._id,
        documentName: m.data?.documentName,
        createdAt: m.createdAt,
        ip: m.data?.ip
      })),
      allMetricsByType,
      totalMetrics: await Metric.countDocuments()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;