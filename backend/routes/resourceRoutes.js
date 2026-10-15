import express from 'express';
import {
  getResources,
  getFeaturedResources,
  getTrendingResources,
  getRecommendedResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getUserResources,
  getResourceMeta,
} from '../controllers/resourceController.js';
import {
  getResourceReviews,
  addReview,
} from '../controllers/reviewController.js';
import { createReport } from '../controllers/reportController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Metadata & lists
router.get('/meta/categories', getResourceMeta);
router.get('/featured', getFeaturedResources);
router.get('/trending', getTrendingResources);
router.get('/recommendations', optionalAuth, getRecommendedResources);
router.get('/user/me', protect, getUserResources);

// Main resource CRUD
router
  .route('/')
  .get(optionalAuth, getResources)
  .post(protect, createResource);

router
  .route('/:id')
  .get(optionalAuth, getResourceById)
  .put(protect, updateResource)
  .delete(protect, deleteResource);

// Nested reviews and reports
router
  .route('/:id/reviews')
  .get(getResourceReviews)
  .post(protect, addReview);

router.post('/:id/reports', protect, createReport);

export default router;
