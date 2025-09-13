// src/controllers/usersController.js
import * as userModel from '../models/userModel.js';

export const listUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    logError(err);
    next(err);
  }
};

