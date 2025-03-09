import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Хендлер для проверки статуса Supabase
export default async function handleSupabaseStatus(req: Request, res: Response) {
  // Проверяем наличие необходимых переменных окружения
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      status: 'error',
      message: 'Supabase configuration is missing',
      missingVars: {
        url: !supabaseUrl,
        serviceKey: !supabaseServiceKey
      }
    });
  }

  const startTime = Date.now();
  
  try {
    // Создаем клиент Supabase с сервисным ключом
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Создаем AbortController для ручного таймаута
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
    
    try {
      // Проверка статуса сервера
      const { data, error, status } = await supabase
        .from('ping')
        .select('*')
        .limit(1)
        .abortSignal(controller.signal); // Используем AbortSignal вместо timeout
      
      clearTimeout(timeoutId); // Очищаем таймаут
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Supabase connection failed',
          error: error.message,
          code: error.code,
          details: error.details,
          responseTime
        });
      }
      
      // Возвращаем успешный статус
      return res.status(200).json({
        status: 'ok',
        message: 'Supabase connection successful',
        responseTime,
        data: {
          status,
          recordsFound: Array.isArray(data) ? data.length : 0
        }
      });
    } catch (fetchError) {
      clearTimeout(timeoutId); // Очищаем таймаут при ошибке
      throw fetchError; // Передаем ошибку внешнему обработчику
    }
  } catch (error: any) {
    // Проверяем, была ли ошибка вызвана истечением таймаута
    const isTimeoutError = error.name === 'AbortError';
    
    return res.status(isTimeoutError ? 504 : 500).json({
      status: 'error',
      message: isTimeoutError 
        ? 'Supabase connection timed out after 5 seconds' 
        : 'Exception during Supabase status check',
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
} 