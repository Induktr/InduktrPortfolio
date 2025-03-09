#!/usr/bin/env node
/**
 * Скрипт для проверки подключения к Supabase
 * 
 * Использование:
 *   node tools/check-supabase.js
 */

// Загружаем конфигурацию из .env файла
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const { performance } = require('perf_hooks');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Функция для форматированного вывода
function log(level, message) {
  const timestamp = new Date().toISOString();
  let color = colors.white;
  
  switch (level) {
    case 'info':
      color = colors.blue;
      break;
    case 'success':
      color = colors.green;
      break;
    case 'warning':
      color = colors.yellow;
      break;
    case 'error':
      color = colors.red;
      break;
  }
  
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

// Проверяем переменные окружения
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

log('info', 'Начинаем проверку подключения к Supabase...');

if (!supabaseUrl) {
  log('error', 'SUPABASE_URL не задан в переменных окружения');
  process.exit(1);
}

log('info', `Supabase URL: ${supabaseUrl}`);
log('info', `Supabase Service Key: ${supabaseServiceKey ? 'задан' : 'не задан'}`);
log('info', `Supabase Anon Key: ${supabaseAnonKey ? 'задан' : 'не задан'}`);

// Проверка доступности API
log('info', `Проверка доступности Supabase API...`);
const startPingTime = performance.now();

https.get(`${supabaseUrl}/ping`, (res) => {
  const endPingTime = performance.now();
  const pingTime = (endPingTime - startPingTime).toFixed(2);
  
  if (res.statusCode === 200) {
    log('success', `API доступен (HTTP ${res.statusCode}), время ответа: ${pingTime}ms`);
  } else {
    log('warning', `API вернул статус ${res.statusCode}, время ответа: ${pingTime}ms`);
  }
  
  // Далее проверяем подключение через SDK если ключи доступны
  checkSupabaseSDK();
}).on('error', (e) => {
  log('error', `Ошибка при проверке API: ${e.message}`);
  
  // Всё равно пытаемся подключиться через SDK
  checkSupabaseSDK();
});

// Функция для проверки подключения через SDK
async function checkSupabaseSDK() {
  // Сначала проверяем с сервисным ключом
  if (supabaseServiceKey) {
    try {
      log('info', 'Проверка подключения с Service Key...');
      const startTime = performance.now();
      
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      // Проверяем соединение с таблицей
      const { data, error, status } = await serviceClient
        .from('users')
        .select('count')
        .limit(1);
      
      const endTime = performance.now();
      const responseTime = (endTime - startTime).toFixed(2);
      
      if (error) {
        log('error', `Ошибка при подключении с Service Key: ${error.message}, код: ${error.code}`);
        log('error', `Детали: ${JSON.stringify(error.details || {})}`);
      } else {
        log('success', `Подключение с Service Key успешно, время ответа: ${responseTime}ms`);
        log('success', `Статус запроса: ${status}, данные: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      log('error', `Исключение при использовании Service Key: ${e.message}`);
    }
  } else {
    log('warning', 'SUPABASE_SERVICE_KEY не задан, пропускаем проверку с сервисным ключом');
  }
  
  // Затем проверяем с анонимным ключом
  if (supabaseAnonKey) {
    try {
      log('info', 'Проверка подключения с Anon Key...');
      const startTime = performance.now();
      
      const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      // Проверяем соединение с публичной таблицей или view
      const { data, error, status } = await anonClient
        .from('ping')
        .select('*')
        .limit(1);
      
      const endTime = performance.now();
      const responseTime = (endTime - startTime).toFixed(2);
      
      if (error) {
        log('error', `Ошибка при подключении с Anon Key: ${error.message}, код: ${error.code}`);
        log('error', `Детали: ${JSON.stringify(error.details || {})}`);
      } else {
        log('success', `Подключение с Anon Key успешно, время ответа: ${responseTime}ms`);
        log('success', `Статус запроса: ${status}, данные: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      log('error', `Исключение при использовании Anon Key: ${e.message}`);
    }
  } else {
    log('warning', 'VITE_SUPABASE_ANON_KEY не задан, пропускаем проверку с анонимным ключом');
  }
  
  log('info', 'Проверка завершена');
} 