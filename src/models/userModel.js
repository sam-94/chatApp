// src/models/userModel.js
import pool from '../config/db.js';

export const getAllUsers = async () => {
  const [rows] = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT 100');
  return rows;
};
