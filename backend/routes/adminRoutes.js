import express from 'express';
import {
  getAdminStats,
  getAdminResources,
  updateResourceStatus,
  getAdminUsers,
  updateUserRole,
  getAdminReports,
  updateReportStatus,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect, admin);

router.get('/stats', getAdminStats);
router.get('/resources', getAdminResources);
router.patch('/resources/:id/status', updateResourceStatus);
router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/reports', getAdminReports);
router.patch('/reports/:id/status', updateReportStatus);

export default router;
