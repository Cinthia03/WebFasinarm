/*require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');  // 👈 NECESARIO
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:4200', 'https://web-fasinarm.vercel.app']
}));

// JSON + URLENCODED
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MULTER para FormData
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Crear carpeta uploads
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
app.use('/uploads', express.static('uploads'));

// POOL SUPABASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000
});

pool.connect().then(() => console.log('✅ Supabase OK'));

// ============================
// RUTAS
// ============================

// GET todos los mantenimientos
app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET por ID
app.get('/api/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM mantenimiento WHERE id_mantenimiento = $1',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error GET por ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST nuevo mantenimiento
app.post('/api/mantenimiento', upload.single('archivo'), async (req, res) => {
  try {
    const { usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion } = req.body;
    if (!usuario || !cedula || !ubicacion || !asunto || !descripcion)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const archivoUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO mantenimiento 
      (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;
    const values = [usuario, cedula, ubicacion, prioridad||'Media', tipomantenimiento||'Preventivo', equipo||'N/A', asunto, descripcion, archivoUrl];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT actualizar mantenimiento
app.put('/api/mantenimiento/:id', upload.single('archivo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion } = req.body;
    const archivoUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

    const query = `
      UPDATE mantenimiento SET
        usuario=$1, cedula=$2, ubicacion=$3, prioridad=$4,
        tipomantenimiento=$5, equipo=$6, asunto=$7, descripcion=$8,
        archivo=COALESCE($9, archivo)
      WHERE id_mantenimiento=$10 RETURNING *
    `;
    const values = [usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivoUrl, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE mantenimiento
app.delete('/api/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM mantenimiento WHERE id_mantenimiento=$1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();

/* =========================
   CONFIGURACIÓN GENERAL
========================= */

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://web-fasinarm.vercel.app'
  ]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   SUPABASE STORAGE
========================= */

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================
   POSTGRESQL CONNECTION
========================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   API ROUTES
========================= */

// Obtener últimos 50 mantenimientos
app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GET mantenimiento error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener mantenimiento por ID
app.get('/api/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM mantenimiento WHERE id_mantenimiento = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('GET mantenimiento by ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear mantenimiento
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

    if (!usuario || !cedula || !ubicacion || !asunto || !descripcion) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios'
      });
    }

    let archivoUrl = null;

    // Subir archivo a Supabase si existe
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { data, error } = await supabase.storage
        .from('mantenimientos')
        .upload(`files/${fileName}`, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (error) throw error;

      archivoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/mantenimientos/${data.path}`;
    }

    const query = `
      INSERT INTO mantenimiento 
      (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

    const values = [
      usuario,
      cedula,
      ubicacion,
      prioridad || 'Media',
      tipomantenimiento || 'Preventivo',
      equipo || 'N/A',
      asunto,
      descripcion,
      archivoUrl
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('POST mantenimiento error:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   EXPORT PARA VERCEL
========================= */

module.exports = app;