import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import { users, toolComments } from "@shared/schema";

// Логирование информации о подключении
console.log("Initializing database connection with DATABASE_URL:", 
  process.env.DATABASE_URL ? 
  `${process.env.DATABASE_URL.substring(0, 25)}...` : 
  "DATABASE_URL is not defined");

// Проверка наличия переменной окружения
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not defined!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Добавляем таймаут для подключения
  connectionTimeoutMillis: 10000,
  // Добавляем максимальное количество повторных попыток
  max: 5,
  // Добавляем время ожидания для запросов
  idleTimeoutMillis: 30000,
  // Добавляем время ожидания для клиентов
  allowExitOnIdle: true,
});

// Обработка ошибок пула соединений
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
    console.error('Error details:', err.message, err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Экспортируем пул для возможности прямого использования
export const dbPool = pool;

// Экспортируем drizzle ORM
export const db = drizzle(pool, { schema: { users, toolComments } });

// Функция для проверки подключения к базе данных
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log('Database connection test successful at:', result.rows[0].now);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return false;
  }
}

// Выполняем тест подключения при импорте модуля
testDatabaseConnection().catch(err => {
  console.error('Failed to test database connection:', err);
});