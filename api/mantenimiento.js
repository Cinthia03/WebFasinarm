const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:4200', 'https://web-fasinarm.vercel.app']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// En Vercel usar memoria
const upload = multer({ storage: multer.memoryStorage() });

// Conexión Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET TODOS
app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC LIMIT 50'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET POR ID
app.get('/api/mantenimiento/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimiento WHERE id_mantenimiento=$1',
      [req.params.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Registro no encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST
app.post('/api/mantenimiento', upload.none(), async (req, res) => {
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

    const result = await pool.query(
      `INSERT INTO mantenimiento
      (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        usuario,
        cedula,
        ubicacion,
        prioridad || 'Media',
        tipomantenimiento || 'Preventivo',
        equipo || 'N/A',
        asunto,
        descripcion
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// PUT
app.put('/api/mantenimiento/:id', upload.none(), async (req, res) => {
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

    const result = await pool.query(
      `UPDATE mantenimiento SET
        usuario=$1,
        cedula=$2,
        ubicacion=$3,
        prioridad=$4,
        tipomantenimiento=$5,
        equipo=$6,
        asunto=$7,
        descripcion=$8
      WHERE id_mantenimiento=$9
      RETURNING *`,
      [
        usuario,
        cedula,
        ubicacion,
        prioridad,
        tipomantenimiento,
        equipo,
        asunto,
        descripcion,
        req.params.id
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Registro no encontrado' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE
app.delete('/api/mantenimiento/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM mantenimiento WHERE id_mantenimiento=$1 RETURNING *',
      [req.params.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Registro no encontrado' });

    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;