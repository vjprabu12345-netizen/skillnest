import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes requiring authentication
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'skillnest_super_secret_jwt_key_2026_secure_learning_platform'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }
      return next();
    } catch (error) {
      console.error('JWT auth error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided.',
    });
  }
};

// Check if authenticated user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrator privileges required.',
  });
};

// Optional auth - populates req.user if token is present, but allows guests
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'skillnest_super_secret_jwt_key_2026_secure_learning_platform'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore invalid token on optional auth
      req.user = null;
    }
  }
  next();
};
