import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import { users, toolComments } from "../shared/schema.js";

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
  console.log("Testing database connection...");
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log('Database connection test successful at:', result.rows[0].now);
      return true;
    } catch (queryError) {
      console.error('Database query error during connection test:', queryError);
      if (queryError instanceof Error) {
        console.error('Query error details:', queryError.message, queryError.stack);
      }
      return false;
    } finally {
      client.release();
    }
  } catch (connectionError) {
    console.error('Database connection test failed - Could not connect:', connectionError);
    if (connectionError instanceof Error) {
      console.error('Connection error details:', connectionError.message, connectionError.stack);
    }
    return false;
  }
}

// Выполняем тест подключения при импорте модуля
testDatabaseConnection().catch(err => {
  console.error('Failed to test database connection:', err);
});