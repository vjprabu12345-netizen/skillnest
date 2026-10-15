import Resource, { RESOURCE_CATEGORIES, RESOURCE_TYPES } from '../models/Resource.js';
import Favourite from '../models/Favourite.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';

// @desc    Get all resources with filtering, searching, sorting & pagination
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res, next) => {
  try {
    const {
      search,
      category,
      resourceType,
      difficulty,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = { status: 'approved' };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Resource Type filter
    if (resourceType && resourceType !== 'All') {
      query.resourceType = resourceType;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Search query (case-insensitive regex for title, description, or tags)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Sort order
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'popular') {
      sortOption = { favouritesCount: -1, averageRating: -1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1, numReviews: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate('author', 'name profileImage email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // If user is authenticated, determine if each resource is favourited
    let userFavouritedIds = new Set();
    if (req.user) {
      const favs = await Favourite.find({ user: req.user._id }).select('resource');
      userFavouritedIds = new Set(favs.map((f) => f.resource.toString()));
    }

    const formattedResources = resources.map((r) => {
      const rObj = r.toObject();
      rObj.isFavourited = userFavouritedIds.has(r._id.toString());
      return rObj;
    });

    res.json({
      success: true,
      data: formattedResources,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured resources for homepage
// @route   GET /api/resources/featured
// @access  Public
export const getFeaturedResources = async (req, res, next) => {
  try {
    let resources = await Resource.find({ status: 'approved', isFeatured: true })
      .populate('author', 'name profileImage')
      .limit(6);

    // If not enough featured explicitly, get top rated
    if (resources.length < 6) {
      const more = await Resource.find({
        status: 'approved',
        _id: { $nin: resources.map((r) => r._id) },
      })
        .populate('author', 'name profileImage')
        .sort({ favouritesCount: -1, averageRating: -1 })
        .limit(6 - resources.length);
      resources = [...resources, ...more];
    }

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending resources
// @route   GET /api/resources/trending
// @access  Public
export const getTrendingResources = async (req, res, next) => {
  try {
    const trending = await Resource.find({ status: 'approved' })
      .populate('author', 'name profileImage')
      .sort({ views: -1, favouritesCount: -1 })
      .limit(6);

    res.json({
      success: true,
      data: trending,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized recommended resources
// @route   GET /api/resources/recommendations
// @access  Public (Optional Auth)
export const getRecommendedResources = async (req, res, next) => {
  try {
    let interests = [];
    if (req.user && req.user.learningInterests && req.user.learningInterests.length > 0) {
      interests = req.user.learningInterests;
    }

    let query = { status: 'approved' };
    if (interests.length > 0) {
      query.category = { $in: interests };
    }

    let recommendations = await Resource.find(query)
      .populate('author', 'name profileImage')
      .sort({ averageRating: -1, favouritesCount: -1 })
      .limit(6);

    if (recommendations.length < 3) {
      recommendations = await Resource.find({ status: 'approved' })
        .populate('author', 'name profileImage')
        .sort({ averageRating: -1 })
        .limit(6);
    }

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID and increment views
// @route   GET /api/resources/:id
// @access  Public
export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'author',
      'name profileImage email bio'
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Increment views asynchronously
    resource.views = (resource.views || 0) + 1;
    await resource.save();

    let isFavourited = false;
    if (req.user) {
      const fav = await Favourite.findOne({
        user: req.user._id,
        resource: resource._id,
      });
      isFavourited = !!fav;
    }

    // Fetch related resources in the same category
    const related = await Resource.find({
      category: resource.category,
      _id: { $ne: resource._id },
      status: 'approved',
    })
      .select('title category resourceType thumbnail averageRating favouritesCount')
      .limit(4);

    const resourceObj = resource.toObject();
    resourceObj.isFavourited = isFavourited;
    resourceObj.related = related;

    res.json({
      success: true,
      data: resourceObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new educational resource
// @route   POST /api/resources
// @access  Private
export const createResource = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      resourceType,
      url,
      thumbnail,
      tags,
      difficulty,
    } = req.body;

    if (!title || !description || !category || !url) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: title, description, category, and URL.',
      });
    }

    // Process tags into array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description.trim(),
      category,
      resourceType: resourceType || 'Course',
      url: url.trim(),
      thumbnail: thumbnail ? thumbnail.trim() : '',
      tags: processedTags,
      difficulty: difficulty || 'All Levels',
      author: req.user._id,
      status: 'approved', // auto-approved for modern collaborative platform; admin can moderate anytime
    });

    const populatedResource = await Resource.findById(resource._id).populate(
      'author',
      'name profileImage email'
    );

    res.status(201).json({
      success: true,
      message: 'Resource published successfully!',
      data: populatedResource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Owner or Admin)
export const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check ownership or admin
    if (
      resource.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this resource. Only the author or an administrator may update it.',
      });
    }

    const {
      title,
      description,
      category,
      resourceType,
      url,
      thumbnail,
      tags,
      difficulty,
      isFeatured,
      status,
    } = req.body;

    if (title) resource.title = title.trim();
    if (description) resource.description = description.trim();
    if (category) resource.category = category;
    if (resourceType) resource.resourceType = resourceType;
    if (url) resource.url = url.trim();
    if (typeof thumbnail === 'string') resource.thumbnail = thumbnail.trim();
    if (difficulty) resource.difficulty = difficulty;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        resource.tags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
      } else if (typeof tags === 'string') {
        resource.tags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    // Only admin can change isFeatured and status directly
    if (req.user.role === 'admin') {
      if (typeof isFeatured === 'boolean') resource.isFeatured = isFeatured;
      if (status) resource.status = status;
    }

    const updatedResource = await resource.save();

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Owner or Admin)
export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check ownership or admin
    if (
      resource.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource.',
      });
    }

    // Cascade delete associated favourites, reviews, and reports
    await Promise.all([
      Favourite.deleteMany({ resource: resource._id }),
      Review.deleteMany({ resource: resource._id }),
      Report.deleteMany({ resource: resource._id }),
      Resource.findByIdAndDelete(resource._id),
    ]);

    res.json({
      success: true,
      message: 'Resource and associated records deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resources published by the logged-in user
// @route   GET /api/resources/user/me
// @access  Private
export const getUserResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ author: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get predefined categories and types
// @route   GET /api/resources/meta/categories
// @access  Public
export const getResourceMeta = (req, res) => {
  res.json({
    success: true,
    categories: RESOURCE_CATEGORIES,
    resourceTypes: RESOURCE_TYPES,
  });
};
