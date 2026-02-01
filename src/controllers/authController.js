import { ApiResponse } from "../utils/apiResponse.js";
import { catchAsync } from '../utils/catchAsync.js';
import { loginUser, registerUser, logoutUser, refreshToken } from "../services/authService.js";

export const register = catchAsync(async (req, res) => { 
  const data = await registerUser(req.body); 
  res.json(new ApiResponse(201, data, "User registered successfully")); 
});

export const login = catchAsync(async (req, res) => { 
  const data = await loginUser(req.body); 
  res.json(new ApiResponse(200, data, 'User Login Successfully'));
});

export const refresh = catchAsync(async (req, res) => {
  const { token } = req.body;
  const data = await refreshToken(token);
  res.json(new ApiResponse(200, data, "Access token refreshed successfully"));
});

export const logout = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const data = await logoutUser(userId);
  res.json(new ApiResponse(200, data, "User logged out successfully"));
});
