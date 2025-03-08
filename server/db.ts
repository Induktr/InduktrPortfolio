import { createClient } from '@supabase/supabase-js';
import { drizzle } from "drizzle-orm/postgres-js";
import { users, toolComments } from "@shared/schema";

// Создаем клиент Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Создаем клиент Drizzle для работы с Supabase через PostgreSQL
const pool = {
  query: async (sql: string, params: any[]) => {
    const { data, error } = await supabase.rpc('pg_query', {
      query_text: sql,
      params_array: params
    });
    
    if (error) throw error;
    return data;
  }
};

// Экспортируем Drizzle клиент для работы с базой данных
export const db = drizzle(pool, { schema: { users, toolComments } });

// Тестируем подключение
supabase.from('users').select('count(*)').then(({ data, error }) => {
  if (error) {
    console.error('Database connection error:', error);
  } else {
    console.log('Database connected successfully');
  }
});