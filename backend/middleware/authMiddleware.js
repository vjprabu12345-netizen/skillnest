import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { DEMO_USERS } from '../controllers/authController.js';

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

      let user = null;
      try {
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          user = await User.findById(decoded.id).select('-password');
        }
      } catch (e) {
        // ignore
      }

      if (!user) {
        const demoUser = DEMO_USERS.find(
          (u) => u._id === decoded.id || u.email.toLowerCase() === (decoded.id || '').toLowerCase()
        );
        if (demoUser) {
          user = { ...demoUser };
        } else if (typeof decoded.id === 'string' && decoded.id.startsWith('seed_')) {
          user = decoded.id.includes('admin') ? DEMO_USERS[0] : DEMO_USERS[1];
        } else if (typeof decoded.id === 'string' && decoded.id.startsWith('guest_')) {
          user = {
            _id: decoded.id,
            name: 'SkillNest Learner',
            email: 'learner@skillnest.org',
            role: 'user',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          };
        }
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }
      req.user = user;
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
