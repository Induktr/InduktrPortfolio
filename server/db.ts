import { createClient } from '@supabase/supabase-js';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';
import { users, toolComments } from "@shared/schema";
import { sql } from 'drizzle-orm';

// Получаем переменные окружения
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const connectionString = process.env.DATABASE_URL || '';
const isProduction = process.env.NODE_ENV === 'production';

// Проверяем наличие необходимых переменных окружения
if (!supabaseUrl) {
  console.error('SUPABASE_URL is not defined in environment variables');
}

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_KEY is not defined in environment variables');
}

if (!connectionString) {
  console.error('DATABASE_URL is not defined in environment variables');
}

// Логирование с временной меткой
function logWithTimestamp(type: 'info' | 'error' | 'warn', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logFn = type === 'info' ? console.log : type === 'error' ? console.error : console.warn;
  
  if (data) {
    logFn(`[${timestamp}] [DB] ${message}`, data);
  } else {
    logFn(`[${timestamp}] [DB] ${message}`);
  }
}

// Создаем клиент Supabase с настройками повторных попыток и таймаутов
logWithTimestamp('info', 'Initializing Supabase client');
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'server',
    },
    fetch: (url, options = {}) => {
      // Устанавливаем таймаут для fetch запросов в 30 секунд
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      logWithTimestamp('info', `Supabase request to ${url.toString()}`);
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      })
        .then(response => {
          clearTimeout(timeoutId);
          logWithTimestamp('info', `Supabase response status: ${response.status}`);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          logWithTimestamp('error', 'Supabase fetch error', error);
          throw error;
        });
    }
  },
  db: {
    schema: 'public',
  }
});

// Создаем клиент postgres с настройками для Drizzle
logWithTimestamp('info', 'Initializing Postgres client');
const client = postgres(connectionString, {
  max: 10, // Максимальное количество соединений в пуле
  idle_timeout: 20, // Время (в секундах) простоя соединения перед закрытием
  connect_timeout: 30, // Время ожидания соединения в секундах
  prepare: false, // Отключаем подготовленные выражения в режиме разработки
  debug: !isProduction, // Включаем отладочные сообщения только в режиме разработки
  onnotice: (notice) => logWithTimestamp('info', 'Postgres notice', notice),
  onparameter: (param) => logWithTimestamp('info', 'Postgres parameter', param),
  types: {
    // Можно добавить пользовательские типы PostgreSQL, если необходимо
  },
  connection: {
    application_name: 'inDuktr_API',
  },
});

// Экспортируем Drizzle клиент для работы с базой данных
export const db = drizzle(client, {
  schema: { users, toolComments },
  logger: !isProduction,
});

// Тестируем подключение
async function testDatabaseConnection() {
  logWithTimestamp('info', 'Testing database connection...');
  
  try {
    // Тестируем подключение Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('ping')
      .select('*')
      .limit(1);
    
    if (supabaseError) {
      logWithTimestamp('error', 'Supabase connection test failed', supabaseError);
    } else {
      logWithTimestamp('info', 'Supabase connection test successful', { rows: supabaseData ? supabaseData.length : 0 });
    }
    
    // Тестируем подключение Postgres через Drizzle
    const pingResult = await db.execute(sql`SELECT 1 as ping`);
    logWithTimestamp('info', 'Database connection successful', pingResult);
    
    return true;
  } catch (error) {
    logWithTimestamp('error', 'Database connection error', error);
    
    // В продакшене пытаемся подключиться еще раз через 5 секунд
    if (isProduction) {
      logWithTimestamp('info', 'Retrying connection in 5 seconds...');
      setTimeout(testDatabaseConnection, 5000);
    }
    
    return false;
  }
}

// Экспортируем SQL для сырых запросов
export { sql };

// Запускаем тест подключения
testDatabaseConnection();