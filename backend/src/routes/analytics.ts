import { Router } from 'express';
import {
  getDashboardAnalytics,
  getProjectAnalytics,
  getTeamAnalytics,
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics
 * @access  Private
 */
router.get('/dashboard', authenticate, getDashboardAnalytics);

/**
 * @route   GET /api/analytics/projects
 * @desc    Get project analytics
 * @access  Private
 */
router.get('/projects', authenticate, getProjectAnalytics);

/**
 * @route   GET /api/analytics/team
 * @desc    Get team performance analytics
 * @access  Private (Manager, Admin)
 */
router.get(
  '/team',
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  getTeamAnalytics
);

export default router;