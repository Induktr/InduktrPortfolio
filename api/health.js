// Простой эндпоинт для проверки работоспособности API
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is up and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown'
  });
} 