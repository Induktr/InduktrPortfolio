// Прокси-функция для перенаправления запросов к серверному API
// Это нужно для совместимости с конфигурацией Vercel Serverless Functions

export default function handler(req, res) {
  // Просто перенаправляем на основной сервер
  res.status(200).json({
    name: 'Induktr API Proxy',
    version: '1.0.0',
    message: 'This endpoint is a proxy to server/api. Please use the server API directly.',
    timestamp: new Date().toISOString()
  });
} 