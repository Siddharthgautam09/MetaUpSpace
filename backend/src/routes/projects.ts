import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
} from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  validateProjectCreation,
  validateProjectUpdate,
  validateMongoId,
  validatePagination,
  handleValidationErrors,
} from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateProjectCreation,
  handleValidationErrors,
  createProject
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validatePagination,
  handleValidationErrors,
  getProjects
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateMongoId('id'),
  handleValidationErrors,
  getProjectById
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project (full update for admin/manager, status only for team members)
 * @access  Private (Admin, Project Manager, Team Members for status only)
 */
router.put(
  '/:id',
  authenticate,
  validateMongoId('id'),
  validateProjectUpdate,
  handleValidationErrors,
  updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Admin, Project Manager)
 */
router.delete(
  '/:id',
  authenticate,
  validateMongoId('id'),
  handleValidationErrors,
  deleteProject
);

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private
 */
router.get(
  '/:id/stats',
  authenticate,
  validateMongoId('id'),
  handleValidationErrors,
  getProjectStats
);

export default router;