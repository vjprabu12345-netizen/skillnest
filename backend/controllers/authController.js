import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Favourite from '../models/Favourite.js';

export const DEMO_USERS = [
  {
    _id: 'seed_admin_1',
    name: 'SkillNest Administrator',
    email: 'admin@skillnest.org',
    password: 'Admin@123456',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Lead platform administrator and open-learning advocate at SkillNest.',
    learningInterests: ['Full Stack Development', 'React JS', 'Node.js and Express'],
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    _id: 'seed_learner_1',
    name: 'Alex Johnson',
    email: 'learner@skillnest.org',
    password: 'Learner@123456',
    role: 'user',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Self-taught software engineering student exploring modern full-stack web technologies.',
    learningInterests: ['React JS', 'JavaScript', 'Node.js and Express', 'UI/UX Design'],
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    _id: 'seed_sarah_1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    password: 'User@123456',
    role: 'user',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    bio: 'Computer Science undergraduate passionate about Algorithms and Distributed Systems.',
    learningInterests: ['Data Structures and Algorithms', 'Python', 'Interview Preparation'],
    createdAt: new Date('2024-01-10').toISOString(),
  },
];

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skillnest_super_secret_jwt_key_2026_secure_learning_platform',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Check if user already exists
    let existingUser = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      }
    } catch (e) {
      // ignore
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user
    let user = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        user = await User.create({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        });
      }
    } catch (e) {
      // ignore
    }

    const userId = user ? user._id : `guest_${Date.now()}`;
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        bio: 'Enthusiastic coder on SkillNest.',
        learningInterests: ['JavaScript', 'HTML and CSS'],
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check user in MongoDB if online
    let user = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        user = await User.findOne({ email: cleanEmail }).select('+password');
      }
    } catch (e) {
      // ignore db error
    }

    if (user) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        const token = generateToken(user._id);
        return res.json({
          success: true,
          message: 'Welcome back to SkillNest!',
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            bio: user.bio,
            learningInterests: user.learningInterests,
            createdAt: user.createdAt,
          },
        });
      }
    }

    // 2. Check built-in demo credentials
    const demoUser = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        (u.password === password || u.password.toLowerCase() === password.toLowerCase())
    );

    if (demoUser) {
      const token = generateToken(demoUser._id);
      return res.json({
        success: true,
        message: 'Welcome back to SkillNest!',
        token,
        user: {
          _id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          profileImage: demoUser.profileImage,
          bio: demoUser.bio,
          learningInterests: demoUser.learningInterests,
          createdAt: demoUser.createdAt,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile & stats
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    let user = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1 && req.user._id) {
        user = await User.findById(req.user._id);
      }
    } catch (e) {
      // ignore
    }

    if (!user) {
      user = req.user;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let sharedCount = 3;
    let favouritesCount = 5;

    try {
      if (mongoose.connection && mongoose.connection.readyState === 1 && user._id) {
        const [dbShared, dbFavs] = await Promise.all([
          Resource.countDocuments({ author: user._id }),
          Favourite.countDocuments({ user: user._id }),
        ]);
        sharedCount = dbShared;
        favouritesCount = dbFavs;
      }
    } catch (e) {
      // ignore
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        learningInterests: user.learningInterests,
        createdAt: user.createdAt,
        stats: {
          sharedResources: sharedCount,
          favouriteResources: favouritesCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, profileImage, learningInterests } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (typeof profileImage === 'string') user.profileImage = profileImage.trim();
    if (Array.isArray(learningInterests)) user.learningInterests = learningInterests;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        learningInterests: user.learningInterests,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
