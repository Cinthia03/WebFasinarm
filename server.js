const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg'); // ✅ PostgreSQL
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ================================================
//           CREAR CARPETA UPLOADS
// ================================================
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ================================================
//           MIDDLEWARE
// ================================================
app.use(cors({
  origin: true, // permite cualquier origen (útil para Vercel)
  credentials: true
}));

app.use('/uploads', express.static(uploadDir));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================
//           CONEXIÓN POSTGRESQL (SUPABASE)
// ================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL (Supabase)'))
  .catch(err => console.error('❌ Error conexión DB:', err));

// ================================================
//           MULTER CONFIG
// ================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

// ================================================
//           OBTENER TODOS
// ================================================
app.get('/mantenimiento', async (req, res) => {
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
//           CREAR REGISTRO
// ================================================
app.post('/mantenimiento', upload.single('archivo'), async (req, res) => {
  try {
    const data = req.body;

    const archivoUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const sql = `
      INSERT INTO mantenimiento
      (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivo, fecha)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING id_mantenimiento
    `;

    const result = await pool.query(sql, [
      data.usuario,
      data.cedula,
      data.ubicacion,
      data.prioridad,
      data.tipomantenimiento,
      data.equipo,
      data.asunto,
      data.descripcion,
      archivoUrl
    ]);

    res.json({
      message: 'Guardado correctamente',
      id: result.rows[0].id_mantenimiento
    });

  } catch (err) {
    console.error('Error POST:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================
//           ELIMINAR REGISTRO
// ================================================
app.delete('/mantenimiento/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const result = await pool.query(
      'DELETE FROM mantenimiento WHERE id_mantenimiento = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'El registro no existe'
      });
    }

    res.json({ message: 'Eliminado correctamente' });

  } catch (err) {
    console.error('Error DELETE:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================
//           MANEJO GLOBAL DE ERRORES
// ================================================
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: err.message
  });
});

// ================================================
//           INICIAR SERVIDOR
// ================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});