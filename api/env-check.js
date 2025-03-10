// Эндпоинт для проверки переменных окружения
export default function handler(req, res) {
  // Собираем информацию о переменных окружения (без их значений)
  const envInfo = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
    VERCEL_URL: process.env.VERCEL_URL || 'not set'
  };

  // Информация о сервере
  const serverInfo = {
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version
  };

  // Проверяем наличие важных переменных окружения
  const missingEnvVars = [];
  if (!process.env.SUPABASE_URL) missingEnvVars.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_KEY) missingEnvVars.push('SUPABASE_SERVICE_KEY');

  res.status(200).json({
    success: true,
    message: 'Environment check completed',
    envInfo,
    serverInfo,
    health: {
      missingEnvVars,
      isHealthy: missingEnvVars.length === 0
    }
  });
} 