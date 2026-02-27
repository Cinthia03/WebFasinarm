import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:4200', 'https://web-fasinarm.vercel.app']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ⚠️ En Vercel NO se pueden guardar archivos en disco permanentemente
// Se usa memoria en lugar de diskStorage
const upload = multer({ storage: multer.memoryStorage() });

// POOL SUPABASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ============================
// RUTAS
// ============================

app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC LIMIT 50'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM mantenimiento WHERE id_mantenimiento = $1',
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Registro no encontrado' });

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mantenimiento', upload.single('archivo'), async (req, res) => {
  try {
    const { usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion } = req.body;

    const query = `
      INSERT INTO mantenimiento 
      (usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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
      descripcion
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/mantenimiento/:id', upload.single('archivo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, cedula, ubicacion, prioridad, tipomantenimiento, equipo, asunto, descripcion } = req.body;

    const query = `
      UPDATE mantenimiento SET
        usuario=$1, cedula=$2, ubicacion=$3, prioridad=$4,
        tipomantenimiento=$5, equipo=$6, asunto=$7, descripcion=$8
      WHERE id_mantenimiento=$9
      RETURNING *
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
      id
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Registro no encontrado' });

    res.status(200).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM mantenimiento WHERE id_mantenimiento=$1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Registro no encontrado' });

    res.status(200).json({ message: 'Eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 Esto reemplaza app.listen()
export default app;