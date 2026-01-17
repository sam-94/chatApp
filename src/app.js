import express from 'express';
import cookieParser from 'cookie-parser';
import pool from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import authMiddleware from './middlewares/authMiddleware.js';
import cors from 'cors';

const app = express()

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ✅ Allow frontend origin and cookies
app.use(cors({
  origin: 'http://localhost:5173',   // your Vite dev server
  credentials: true,                 // allow cookies and auth headers
}));


app.use('/api/auth', authRouter);

// protect users endpoints
app.use('/api/users', authMiddleware, usersRouter);

// other routes...
app.get('/api/db-test', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT VERSION() as version');
    res.json({ mysql_version: rows[0].version });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

export { app }