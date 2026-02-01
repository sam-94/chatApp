import * as userModel from '../models/userModel.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listUsers = catchAsync(async (req, res, next) => {
    const users = await userModel.getAllUsers();
    res.json(users);
});

