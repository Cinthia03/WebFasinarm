require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ================================================
// CREAR CARPETA UPLOADS
// ================================================
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ================================================
// MIDDLEWARE
// ================================================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// ================================================
// CONEXIÓN SUPABASE
// ================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('✅ Conectado a Supabase'))
  .catch(err => console.error('❌ Error conexión DB:', err));

// ================================================
// MULTER
// ================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});
const upload = multer({ storage });

// ================================================
// GET TODOS
// ================================================
app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================
// POST CREAR
// ================================================
app.post('/api/mantenimiento', upload.single('archivo'), async (req, res) => {
  try {

    const {
      usuario,
      cedula,
      ubicacion,
      prioridad,
      tipomantenimiento,
      equipo,
      asunto,
      descripcion
    } = req.body;

    const archivo = req.file ? `/uploads/${req.file.filename}` : null;
    const fecha = new Date();

    const query = `
      INSERT INTO mantenimiento 
      (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivo, fecha)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      usuario,
      cedula,
      ubicacion,
      prioridad,
      tipomantenimiento,
      equipo,
      asunto,
      descripcion,
      archivo,
      fecha
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error POST:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================
// DELETE
// ================================================
app.delete('/api/mantenimiento/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      'DELETE FROM mantenimiento WHERE id_mantenimiento = $1',
      [id]
    );

    res.json({ message: 'Eliminado correctamente' });

  } catch (err) {
    console.error('Error DELETE:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});