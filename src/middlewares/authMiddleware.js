import jwt from 'jsonwebtoken';
import * as authModel from '../models/authModel.js';

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization format' });

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      return next();
    } catch (accessErr) {
      // access token invalid/expired -> try refresh token
      const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body?.refreshToken;
      if (!refreshToken) return res.status(401).json({ error: 'Access token expired. Provide refresh token' });

      const userWithToken = await authModel.findByRefreshToken(refreshToken);
      if (!userWithToken) return res.status(403).json({ error: 'Refresh token invalid' });

      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // rotate refresh token: create new refresh and store it
        const newAccessToken = jwt.sign({ id: userWithToken.id, email: userWithToken.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });
        const newRefreshToken = jwt.sign({ id: userWithToken.id, email: userWithToken.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });

        // persist rotated refresh token
        await authModel.saveRefreshToken(userWithToken.id, newRefreshToken);

        // set httpOnly secure cookie
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7*24*3600*1000 });

        res.setHeader('x-access-token', newAccessToken);
        req.user = { id: userWithToken.id, email: userWithToken.email };
        return next();
      } catch (refreshErr) {
        return res.status(403).json({ error: 'Refresh token invalid or expired' });
      }
    }
  } catch (err) {
    next(err);
  }
};
