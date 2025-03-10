import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Простой API-эндпоинт для проверки переменных окружения
export default function handleEnvCheck(req: Request, res: Response) {
  try {
    // Собираем информацию о переменных окружения (без их значений)
    const envInfo = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
      npm_package_version: process.env.npm_package_version || 'not set'
    };

    // Информация о сервере
    const serverInfo = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      uptimeSeconds: process.uptime(),
      memoryUsage: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      }
    };

    // Проверяем наличие важных переменных окружения
    const missingEnvVars = [];
    if (!process.env.SUPABASE_URL) missingEnvVars.push('SUPABASE_URL');
    if (!process.env.SUPABASE_SERVICE_KEY) missingEnvVars.push('SUPABASE_SERVICE_KEY');

    return res.status(200).json({
      success: true,
      message: 'Environment check completed',
      envInfo,
      serverInfo,
      health: {
        missingEnvVars,
        isHealthy: missingEnvVars.length === 0
      }
    });
  } catch (error: any) {
    console.error('Error during environment check:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error during environment check',
      error: error.message || 'Unknown error'
    });
  }
} 