import mongoose from 'mongoose';

export const RESOURCE_CATEGORIES = [
  'HTML and CSS',
  'JavaScript',
  'React JS',
  'Node.js and Express',
  'MongoDB and Databases',
  'Full Stack Development',
  'UI/UX Design',
  'Python',
  'Java',
  'Data Structures and Algorithms',
  'Interview Preparation',
  'Free Coding Courses',
  'DevOps & Cloud',
  'Other',
];

export const RESOURCE_TYPES = [
  'Course',
  'Article',
  'Video',
  'Documentation',
  'Book',
  'Interactive Tool',
  'Cheatsheet',
];

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a resource title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters long'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: {
        values: RESOURCE_CATEGORIES,
        message: '{VALUE} is not a supported category',
      },
    },
    resourceType: {
      type: String,
      enum: RESOURCE_TYPES,
      default: 'Course',
    },
    url: {
      type: String,
      required: [true, 'Please provide a valid external resource URL'],
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?(#.*)?$/,
        'Please provide a valid HTTP or HTTPS URL',
      ],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    favouritesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searching, filtering and sorting
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ favouritesCount: -1, createdAt: -1 });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
