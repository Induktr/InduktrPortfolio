// Диагностический API эндпоинт для показа структуры проекта и переменных окружения
import { readdir } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
  try {
    // Список файлов в директории api
    let apiFiles = [];
    try {
      const files = await readdir('./api', { withFileTypes: true });
      apiFiles = files.map(file => 
        file.isDirectory() ? `${file.name}/` : file.name
      );
    } catch (error) {
      apiFiles = [`Error reading api directory: ${error.message}`];
    }

    // Список файлов в директории api/auth
    let authFiles = [];
    try {
      const files = await readdir('./api/auth', { withFileTypes: true });
      authFiles = files.map(file => file.name);
    } catch (error) {
      authFiles = [`Error reading api/auth directory: ${error.message}`];
    }

    // Информация о переменных окружения
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL === '1' ? 'true' : 'false',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'not set'
    };

    // Отправляем всю собранную информацию
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      apiDirectory: {
        files: apiFiles
      },
      authDirectory: {
        files: authFiles
      },
      environment: envInfo,
      requestHeaders: req.headers,
      vercelConfig: {
        functions: {
          pattern: "api/**/*"
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error gathering debug information',
      error: error.message
    });
  }
} 