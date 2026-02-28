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

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Middleware
//app.use(cors({ origin: ['http://localhost:4200', 'https://web-fasinarm.vercel.app'] }));
app.use(cors({
  origin: function (origin, callback) {
    // Permite localhost, tu dominio principal y cualquier subdominio de vercel.app
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const upload = multer({ storage: multer.memoryStorage() });

// Supabase Storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000
});


// API ROUTES
app.get('/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM mantenimiento WHERE id_mantenimiento = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mantenimiento', upload.single('archivo'), async (req, res) => {
  try {
    const { usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion } = req.body;
    if (!usuario || !cedula || !ubicacion || !asunto || !descripcion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    let archivoUrl = null;
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('mantenimientos')
        .upload(`files/${fileName}`, req.file.buffer, { 
          contentType: req.file.mimetype,
          upsert: true 
        });
      if (error) throw error;
      archivoUrl = `${supabaseUrl}/storage/v1/object/public/mantenimientos/${data.path}`;
    }

    const query = `
      INSERT INTO mantenimiento (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
    `;
    const values = [usuario, cedula, ubicacion, prioridad || 'Media', tipomantenimiento || 'Preventivo', equipo || 'N/A', asunto, descripcion, archivoUrl];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/mantenimiento/:id', upload.single('archivo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion } = req.body;
    let archivoUrl = req.body.archivo || null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('mantenimientos')
        .upload(`files/${fileName}`, req.file.buffer, { 
          contentType: req.file.mimetype,
          upsert: true 
        });
      if (error) throw error;
      archivoUrl = `${supabaseUrl}/storage/v1/object/public/mantenimientos/${data.path}`;
    }

    const query = `
      UPDATE mantenimiento SET usuario=$1, cedula=$2, ubicacion=$3, prioridad=$4, tipomantenimiento=$5, 
      equipo=$6, asunto=$7, descripcion=$8, archivo=COALESCE($9, archivo)
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

app.delete('/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM mantenimiento WHERE id_mantenimiento=$1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Frontend Angular SPA
/*const distPath = path.join(process.cwd(), 'dist', 'client');
app.use('/assets', express.static(distPath));
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send('Frontend no construido. Vercel debe ejecutar "npm run build:client"');
      }
    });
  }
});*/

// Servidor local (solo desarrollo)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 API Server: http://localhost:${PORT}`);
    console.log(`📊 Test: http://localhost:${PORT}/mantenimiento`);
  });
}


module.exports = (req, res) => {
  return app(req, res);
};