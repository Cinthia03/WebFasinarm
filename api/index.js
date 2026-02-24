require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== CONEXIÓN SUPABASE =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===== RUTA TEST =====
app.get('/', (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// ===== GET TODOS =====
app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ===== POST CREAR =====
app.post('/api/mantenimiento', async (req, res) => {
  try {

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Body vacío. Enviar JSON." });
    }

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

    if (!usuario || !cedula) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    const fecha = new Date();

    const result = await pool.query(
      `INSERT INTO mantenimiento 
       (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivo, fecha)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
        null,
        fecha
      ]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("POST ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ===== DELETE =====
app.delete('/api/mantenimiento/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM mantenimiento WHERE id_mantenimiento = $1',
      [req.params.id]
    );
    return res.status(200).json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 🔥 EXPORT CORRECTO PARA VERCEL
module.exports = (req, res) => {
  app(req, res);
};