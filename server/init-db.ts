import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the database URL from environment variables
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
});

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Check connection
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Read migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_tables.sql');
    console.log('Reading migration file:', migrationPath);
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    console.log('Executing migration...');
    await pool.query(sql);
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase(); 