// Прокси-функция для перенаправления запросов к серверному API
// Это нужно для совместимости с конфигурацией Vercel Serverless Functions

export default function handler(req, res) {
  // Просто возвращаем информацию об API
  res.status(200).json({
    name: 'Induktr API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/env-check',
      '/api/auth/signup',
      '/api/auth/signin'
    ]
  });
} 