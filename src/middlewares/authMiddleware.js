import jwt from 'jsonwebtoken';
import * as authModel from '../models/authModel.js';

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization format' });

    const token = parts[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (!err) {
        req.user = decoded;
        return next();
      }

      if (err.name === 'TokenExpiredError') {
        const refreshToken = req.headers['x-refresh-token'] || req.body.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: 'Access token expired. Provide refresh token' });

        const userWithToken = await authModel.findByRefreshToken(refreshToken);
        if (!userWithToken) return res.status(403).json({ error: 'Refresh token invalid' });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (refreshErr) => {
          if (refreshErr) return res.status(403).json({ error: 'Refresh token invalid or expired' });

          const newAccessToken = jwt.sign(
            { id: userWithToken.id, email: userWithToken.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' }
          );

          res.setHeader('x-access-token', newAccessToken);
          req.user = { id: userWithToken.id, email: userWithToken.email };
          return next();
        });
      } else {
        return res.status(401).json({ error: 'Invalid access token' });
      }
    });
  } catch (err) {
    next(err);
  }
};
