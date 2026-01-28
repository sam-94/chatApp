import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

['DB_HOST', 'DB_USER', 'DB_NAME'].forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
});

pool.on && pool.on('error', (err) => {
    console.error('MySQL pool error', err);
});

export default pool;