require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// ================================================
// MIDDLEWARE
// ================================================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================
// CONEXIÓN SUPABASE
// ================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
app.post('/api/mantenimiento', async (req, res) => {
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
      null,
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
// EXPORT PARA VERCEL
// ================================================
module.exports = app;