import Favourite from '../models/Favourite.js';
import Resource from '../models/Resource.js';

// @desc    Get all favourite resources of logged-in user
// @route   GET /api/favourites
// @access  Private
export const getFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ user: req.user._id })
      .populate({
        path: 'resource',
        populate: {
          path: 'author',
          select: 'name profileImage',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out any where resource might have been deleted
    const validFavourites = favourites
      .filter((fav) => fav.resource !== null)
      .map((fav) => {
        const item = fav.toObject();
        if (item.resource) {
          item.resource.isFavourited = true;
        }
        return item;
      });

    res.json({
      success: true,
      count: validFavourites.length,
      data: validFavourites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add resource to favourites
// @route   POST /api/favourites/:resourceId
// @access  Private
export const addFavourite = async (req, res, next) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const existing = await Favourite.findOne({
      user: req.user._id,
      resource: resourceId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Resource is already in your favourites.',
      });
    }

    const favourite = await Favourite.create({
      user: req.user._id,
      resource: resourceId,
    });

    // Increment favourites count
    await Resource.findByIdAndUpdate(resourceId, {
      $inc: { favouritesCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Added to favourites',
      data: favourite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove resource from favourites
// @route   DELETE /api/favourites/:resourceId
// @access  Private
export const removeFavourite = async (req, res, next) => {
  try {
    const { resourceId } = req.params;

    const favourite = await Favourite.findOneAndDelete({
      user: req.user._id,
      resource: resourceId,
    });

    if (!favourite) {
      return res.status(404).json({
        success: false,
        message: 'Favourite record not found',
      });
    }

    // Decrement favourites count but don't go below 0
    await Resource.findByIdAndUpdate(resourceId, {
      $inc: { favouritesCount: -1 },
    });
    // Ensure not negative
    await Resource.updateOne(
      { _id: resourceId, favouritesCount: { $lt: 0 } },
      { $set: { favouritesCount: 0 } }
    );

    res.json({
      success: true,
      message: 'Removed from favourites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a specific resource is favourited by current user
// @route   GET /api/favourites/check/:resourceId
// @access  Private
export const checkFavourite = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const favourite = await Favourite.findOne({
      user: req.user._id,
      resource: resourceId,
    });

    res.json({
      success: true,
      isFavourited: !!favourite,
    });
  } catch (error) {
    next(error);
  }
};
