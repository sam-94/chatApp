import pool from '../config/db.js';

export const getAllUsers = async (page = 1, limit = 10) => { 
  const offset = (page - 1) * limit; 
  // Query for paginated users 
  const [rows] = await pool.query( 'SELECT id, name, email FROM users ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset] ); 
  // Query for total count
  const [countRows] = await pool.query('SELECT COUNT(*) as count FROM users'); 
  const total = countRows[0].count; 
  return { users: rows, total }; 
};