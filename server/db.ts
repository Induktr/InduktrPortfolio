import { createClient } from '@supabase/supabase-js';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';
import { users, toolComments } from "@shared/schema";

// Создаем клиент Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Создаем клиент postgres для Drizzle
// Используем DATABASE_URL из переменных окружения
const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString);

// Экспортируем Drizzle клиент для работы с базой данных
export const db = drizzle(client, { schema: { users, toolComments } });

// Тестируем подключение
supabase.from('users').select('count(*)').then(({ data, error }) => {
  if (error) {
    console.error('Database connection error:', error);
  } else {
    console.log('Database connected successfully');
  }
});