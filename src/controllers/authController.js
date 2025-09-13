import * as authModel from '../models/authModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from '../utils/apiError.js';

const generateAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });

    const existing = await authModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await authModel.createUser({ name, email, password: hashed });

    res.status(201).json(
		new ApiResponse(201, createdUser, "User registered Successfully")
	);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await authModel.findByEmail(email);
    const match = await bcrypt.compare(password, user.password);

    if (!user || !match) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await authModel.saveRefreshToken(user.id, refreshToken);
	const loggedInUser = await authModel.findByEmail(user.email);


    res.json(new ApiResponse(201, loggedInUser, "User registered Successfully"));
	
  } catch (err) {
    return res.json(new ApiError(500, "something", err))
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });

    const stored = await authModel.findByRefreshToken(token);
    if (!stored) return res.status(403).json({ error: 'Refresh token invalid' });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired refresh token' });
      const accessToken = generateAccessToken(stored);
      res.json({ accessToken });
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await authModel.removeRefreshToken(userId);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};
