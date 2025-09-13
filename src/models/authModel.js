// src/models/authModel.js
import pool from '../config/db.js';

export const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT id, name, email, refresh_token FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0];
};

export const createUser = async ({ name, email, password }) => {
  const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
  return { id: result.insertId, name, email };
};

export const saveRefreshToken = async (userId, token) => {
  await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [token, userId]);
};

export const findByRefreshToken = async (token) => {
  const [rows] = await pool.query('SELECT id, name, email, refresh_token FROM users WHERE refresh_token = ? LIMIT 1', [token]);
  return rows[0];
};

export const removeRefreshToken = async (userId) => {
  await pool.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [userId]);
};
