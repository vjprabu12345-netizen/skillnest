import Review from '../models/Review.js';
import Resource from '../models/Resource.js';

// @desc    Get reviews for a resource
// @route   GET /api/resources/:id/reviews
// @access  Public
export const getResourceReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ resource: id })
      .populate('user', 'name profileImage email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review & rating to a resource
// @route   POST /api/resources/:id/reviews
// @access  Private
export const addReview = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;
    const { rating, reviewText } = req.body;

    if (!rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a numeric rating (1-5) and your review comments.',
      });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if user has already reviewed this resource
    const alreadyReviewed = await Review.findOne({
      resource: resourceId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this resource. You can edit your existing review.',
      });
    }

    const review = await Review.create({
      resource: resourceId,
      user: req.user._id,
      rating: numericRating,
      reviewText: reviewText.trim(),
    });

    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'name profileImage email'
    );

    // Fetch refreshed resource rating stats
    const updatedResource = await Resource.findById(resourceId).select(
      'averageRating numReviews'
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      data: populatedReview,
      resourceStats: updatedResource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this review',
      });
    }

    if (rating) {
      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      review.rating = numRating;
    }

    if (reviewText) {
      review.reviewText = reviewText.trim();
    }

    await review.save();
    await Review.calculateAverageRating(review.resource);

    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'name profileImage'
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const resourceId = review.resource;
    await Review.findByIdAndDelete(id);
    await Review.calculateAverageRating(resourceId);

    res.json({
      success: true,
      message: 'Review removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
