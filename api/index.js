require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// ================= MIDDLEWARE =================
// Configurado para permitir peticiones desde tu frontend
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= CONEXIÓN SUPABASE =================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ruta de salud para verificar que el servidor vive
app.get('/', (req, res) => res.send('Servidor de Inventario Operativo'));

// ================= GET TODOS =================
app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= POST CREAR =================
app.post('/api/mantenimiento', async (req, res) => {
  try {
    // Validar que el body no venga vacío (Soluciona el error de desestructuración)
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Cuerpo de petición vacío. Asegúrate de enviar JSON." });
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

    // Validación mínima de datos
    if (!usuario || !cedula) {
      return res.status(400).json({ error: "Faltan campos obligatorios (usuario o cedula)" });
    }

    const fecha = new Date();
    const query = `
      INSERT INTO mantenimiento 
      (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, archivo, fecha)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion, null, fecha];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================= DELETE =================
app.delete('/api/mantenimiento/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM mantenimiento WHERE id_mantenimiento = $1', [id]);
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Exportar para Vercel
module.exports = app;