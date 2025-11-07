const express = require('express');
const path = require('path'); // 👈 para manejar rutas de archivo
const multer = require('multer'); // 👈 para subir imágenes
const Workshop = require('../models/Workshop');
const router = express.Router();

// GET /api/workshops - Obtener todos los talleres (público y admin)
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      category, 
      search, 
      page = 1, 
      limit = 10,
      upcoming = false 
    } = req.query;

    let query = {};

    // Filtro por estado
    if (status && status !== 'programado') {
      query.status = status;
    }

    // Filtro por categoría
    if (category) {
      query.category = category;
    }

    // Filtro para talleres futuros
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'programado';
    }

    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: 1, createdAt: -1 }
    };

    const workshops = await Workshop.find(query)
      .sort(options.sort)
      .limit(options.limit * options.page)
      .skip((options.page - 1) * options.limit);

    const total = await Workshop.countDocuments(query);

    res.json({
      workshops,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los talleres', error: error.message });
  }
});

// GET /api/workshops/:id - Obtener un taller específico
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el taller', error: error.message });
  }
});

// 📁 Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/workshops'); // carpeta donde se guardan los flyers
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Solo se permiten imágenes JPG o PNG.'));
    } else {
      cb(null, true);
    }
  }
});

// 📤 Crear nuevo taller con imagen
router.post('/', upload.single('flyer'), async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      date,
      time,
      duration,
      location,
      capacity,
      price,
      category,
      requirements,
      materials,
      status
    } = req.body;

    if (!title || !description || !instructor || !date || !time || !duration || !location || !capacity) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben ser llenados' });
    }

    const imagePath = req.file ? `/uploads/workshops/${req.file.filename}` : '';

    const newWorkshop = new Workshop({
      title,
      description,
      instructor,
      date: new Date(date),
      time,
      duration,
      location,
      capacity: parseInt(capacity),
      image: imagePath, // 👈 guarda la ruta del flyer
      price: price || 0,
      category: category || 'educacion-ambiental',
      requirements: JSON.parse(requirements || '[]'),
      materials: JSON.parse(materials || '[]'),
      status: status || 'programado'
    });

    const savedWorkshop = await newWorkshop.save();
    res.status(201).json(savedWorkshop);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear el taller', error: error.message });
  }
});

// PUT /api/workshops/:id - Actualizar taller (solo admin)
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      date,
      time,
      duration,
      location,
      capacity,
      status,
      image,
      price,
      category,
      requirements,
      materials
    } = req.body;

    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    // Actualizar campos
    if (title) workshop.title = title;
    if (description) workshop.description = description;
    if (instructor) workshop.instructor = instructor;
    if (date) {
      const workshopDate = new Date(date);
      // 🔹 SOLO VALIDAR FECHA FUTURA SI NO ESTÁ CANCELADO
      if (workshopDate < new Date() && workshop.status !== 'cancelado' && status !== 'cancelado') {
        return res.status(400).json({ message: 'La fecha del taller debe ser futura' });
      }
      workshop.date = workshopDate;
    }
    if (time) workshop.time = time;
    if (duration) workshop.duration = duration;
    if (location) workshop.location = location;
    if (capacity) workshop.capacity = parseInt(capacity);
    if (status) workshop.status = status;
    if (image !== undefined) workshop.image = image;
    if (price !== undefined) workshop.price = price;
    if (category) workshop.category = category;
    if (requirements) workshop.requirements = requirements;
    if (materials) workshop.materials = materials;

    // Validar que registered no sea mayor a capacity
    if (workshop.registered > workshop.capacity) {
      workshop.registered = workshop.capacity;
    }

    const updatedWorkshop = await workshop.save();
    res.json(updatedWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el taller', error: error.message });
  }
});

// DELETE /api/workshops/:id - Eliminar taller (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    // 🔹 PERMITIR ELIMINAR SI ESTÁ CANCELADO, incluso con inscritos
    if (workshop.registered > 0 && workshop.status !== 'cancelado') {
      return res.status(400).json({ 
        message: 'No se puede eliminar un taller con participantes inscritos. Cambia el estado a "cancelado" en su lugar.' 
      });
    }

    await Workshop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Taller eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el taller', error: error.message });
  }
});

// PATCH /api/workshops/:id/register - Inscribir participante
router.patch('/:id/register', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    if (workshop.status !== 'programado') {
      return res.status(400).json({ message: 'No se pueden realizar inscripciones a este taller' });
    }

    if (workshop.registered >= workshop.capacity) {
      return res.status(400).json({ message: 'El taller ha alcanzado su capacidad máxima' });
    }

    workshop.registered += 1;
    const updatedWorkshop = await workshop.save();

    res.json(updatedWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Error al inscribirse en el taller', error: error.message });
  }
});

// PATCH /api/workshops/:id/cancel-registration - Cancelar inscripción
router.patch('/:id/cancel-registration', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Taller no encontrado' });
    }

    if (workshop.registered > 0) {
      workshop.registered -= 1;
    }

    const updatedWorkshop = await workshop.save();
    res.json(updatedWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar la inscripción', error: error.message });
  }
});

module.exports = router;