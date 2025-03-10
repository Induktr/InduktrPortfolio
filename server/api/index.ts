import express from 'express';
import handleSupabaseStatus from './supabase-status';
import handleSignUp from './auth/signup';
import handleSignIn from './auth/signin';
import handleGetCurrentUser from './auth/me';

// Роуты API
const router = express.Router();

// Базовый эндпоинт для проверки работоспособности API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Роут для проверки статуса Supabase
router.get('/supabase-status', handleSupabaseStatus);

// Auth endpoints
router.post('/auth/signup', handleSignUp);
router.post('/auth/signin', handleSignIn);
router.get('/auth/me', handleGetCurrentUser);

// Эндпоинт для получения информации о среде выполнения
router.get('/env-info', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Обработчик 404 для API запросов
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

export default router; 