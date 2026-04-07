import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import eventosRoutes from './routes/eventos.routes.js';
import salonesRoutes from './routes/salones.routes.js';
import asistentesRoutes from './routes/asistentes.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/salones', salonesRoutes);
app.use('/api/asistentes', asistentesRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  console.log('✓ Test endpoint called');
  res.json({ mensaje: 'Backend funcionando' });
});

// Middleware de error global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: err.message || 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🔗 Frontend debe conectar a: http://localhost:${PORT}/api`);
});