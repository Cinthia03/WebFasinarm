const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise'); 
const multer = require("multer");
const fs = require('fs'); // <--- IMPORTANTE: Faltaba este import

// ================================================
//           CONFIGURACIÓN APP
// ================================================
const app = express();
const PORT = 3000;

// Asegurar que la carpeta uploads exista (Evita error 500 al subir archivos)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// ================================================
//           MIDDLEWARE 
// ================================================
app.use(cors({
  origin: 'http://localhost:4200', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Servir archivos estáticos ANTES de las rutas
// Esto permite que http://localhost:3000/uploads/nombre.jpg sea accesible
app.use('/uploads', express.static(uploadDir));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================
//           CONEXIÓN MYSQL
// ================================================
const pool = mysql.createPool({
  host: 'sql10.freesqldatabase.com',
  port: 3306,
  database: 'sql10817826',
  user: 'sql10817826',
  password: '3tHp4yMKTR',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z' // Ayuda a manejar fechas UTC correctamente
});

pool.getConnection()
  .then(() => console.log('✅ Conectado a MySQL Freesqldatabase'))
  .catch(err => console.error('❌ Error MySQL:', err));

/* ===============================
   MULTER CONFIG
=============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Reemplazamos espacios para evitar errores en URLs de navegador
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + "-" + safeName);
  }
});
const upload = multer({ storage });

// ================================================
//           RUTAS MANTENIMIENTO
// ================================================

// OBTENER TODOS
app.get('/mantenimiento', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM mantenimiento ORDER BY id_mantenimiento DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREAR REGISTRO (Corregido para insertar fecha y archivo correctamente)
app.post("/mantenimiento", upload.single("archivo"), async (req, res) => {
  try {
    const data = req.body;
    // Construimos la URL que Angular usará para mostrar la imagen
    const archivoUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

    const sql = `INSERT INTO mantenimiento 
      (usuario, cedula, ubicacion, prioridad, tipoMantenimiento, equipo, asunto, descripcion, archivo, fecha) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const [result] = await pool.query(sql, [
      data.usuario, 
      data.cedula, 
      data.ubicacion, 
      data.prioridad,
      data.tipoMantenimiento, 
      data.equipo, 
      data.asunto, 
      data.descripcion, 
      archivoUrl
    ]);

    res.json({ message: "Guardado correctamente", id: result.insertId });
  } catch (err) {
    console.error("❌ Error DB:", err);
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
});

// ELIMINAR
app.delete('/mantenimiento/:id', async (req, res) => {
  try {
    const idEliminar = req.params.id;
    const [result] = await pool.query(
      'DELETE FROM mantenimiento WHERE id_mantenimiento = ?', 
      [idEliminar]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'El registro no existe en la base de datos' });
    }

    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    console.error("Error en DELETE:", err);
    res.status(500).json({ error: err.message });
  }
});




// ================================================
//           MANEJO DE ERRORES GLOBAL
// ================================================
app.use((err, req, res, next) => {
  console.error('Error detectado:', err);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

// ================================================
//           INICIAR SERVIDOR
// ================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});