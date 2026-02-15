import * as userModel from '../models/userModel.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listUsers = catchAsync(async (req, res, next) => {
  // Get page and limit from query params, with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Call service/model
  const { users, total } = await userModel.getAllUsers(page, limit);

  res.json({
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


