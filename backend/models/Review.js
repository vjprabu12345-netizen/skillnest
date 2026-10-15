import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: [true, 'Please write your review thoughts'],
      trim: true,
      minlength: [5, 'Review must be at least 5 characters long'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per resource
reviewSchema.index({ user: 1, resource: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (resourceId) {
  const stats = await this.aggregate([
    {
      $match: { resource: resourceId },
    },
    {
      $group: {
        _id: '$resource',
        numReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Resource').findByIdAndUpdate(resourceId, {
        numReviews: stats[0].numReviews,
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
      });
    } else {
      await mongoose.model('Resource').findByIdAndUpdate(resourceId, {
        numReviews: 0,
        averageRating: 0,
      });
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.resource);
});

// Call calculateAverageRating after remove/delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.resource);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
