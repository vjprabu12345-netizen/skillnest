import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Review from '../models/Review.js';
import Favourite from '../models/Favourite.js';

// @desc    Get public community metrics based on real database data
// @route   GET /api/stats/summary
// @access  Public
export const getPublicStats = async (req, res, next) => {
  try {
    const [
      totalLearners,
      totalResources,
      totalReviews,
      totalFavourites,
      categoryCounts,
    ] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments({ status: 'approved' }),
      Review.countDocuments(),
      Favourite.countDocuments(),
      Resource.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalLearners,
        totalResources,
        totalReviews,
        totalFavourites,
        popularCategories: categoryCounts.map((c) => ({
          name: c._id,
          count: c.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
