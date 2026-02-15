import * as authModel from '../models/authModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
  );

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError('name, email and password required', 400);
  }

  const existing = await authModel.findByEmail(email);
  if (existing) {
    throw new AppError('User already exists', 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await authModel.createUser({ name, email, password: hashed });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await authModel.saveRefreshToken(user.id, refreshToken);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password required', 400);
  }

  const user = await authModel.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await authModel.saveRefreshToken(user.id, refreshToken);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accessToken,
    refreshToken
  }
};

export const refreshToken = async (token) => { 
    if (!token) throw new AppError("Refresh token required", 400); 
    const stored = await authModel.findByRefreshToken(token); 
    if (!stored) throw new AppError("Refresh token invalid", 403); 
    try { 
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET); 
    } catch (err) { 
        throw new AppError("Refresh token invalid or expired", 403); 
    } 
    const accessToken = generateAccessToken(stored); 
    return { accessToken }; 
}; 
export const logoutUser = async (userId) => { 
    if (!userId) throw new AppError("userId is required", 400); 
    await authModel.removeRefreshToken(userId); 
    return {}; 
};