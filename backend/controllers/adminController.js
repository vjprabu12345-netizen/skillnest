import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Review from '../models/Review.js';
import Favourite from '../models/Favourite.js';
import Report from '../models/Report.js';

// @desc    Get system-wide metrics and stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalResources,
      pendingResources,
      approvedResources,
      rejectedResources,
      totalReviews,
      totalFavourites,
      pendingReports,
      totalReports,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Resource.countDocuments(),
      Resource.countDocuments({ status: 'pending' }),
      Resource.countDocuments({ status: 'approved' }),
      Resource.countDocuments({ status: 'rejected' }),
      Review.countDocuments(),
      Favourite.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments(),
      Resource.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          regular: totalUsers - totalAdmins,
        },
        resources: {
          total: totalResources,
          approved: approvedResources,
          pending: pendingResources,
          rejected: rejectedResources,
        },
        engagement: {
          reviews: totalReviews,
          favourites: totalFavourites,
        },
        reports: {
          total: totalReports,
          pending: pendingReports,
        },
        topCategories: categoryStats.map((c) => ({
          category: c._id,
          count: c.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resources for moderation
// @route   GET /api/admin/resources
// @access  Private/Admin
export const getAdminResources = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { category: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate('author', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource moderation status or feature flag
// @route   PATCH /api/admin/resources/:id/status
// @access  Private/Admin
export const updateResourceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be pending, approved, or rejected',
        });
      }
      resource.status = status;
    }

    if (typeof isFeatured === 'boolean') {
      resource.isFeatured = isFeatured;
    }

    await resource.save();

    res.json({
      success: true,
      message: `Resource has been updated to "${resource.status}" status.`,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;

    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (user <-> admin)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be user or admin',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent removing own admin role accidentally
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot revoke your own administrator privileges.',
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role changed to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get moderation reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAdminReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('resource', 'title url category author status')
      .populate('reportingUser', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id/status
// @access  Private/Admin
export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report status',
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = status;
    if (resolutionNotes) {
      report.resolutionNotes = resolutionNotes.trim();
    }
    await report.save();

    res.json({
      success: true,
      message: `Report marked as ${status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
