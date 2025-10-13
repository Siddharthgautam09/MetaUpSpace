import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getMyTasks,
} from '../controllers/taskController';
import { authenticate, checkTeamMembership } from '../middleware/auth';
import {
  validateTaskCreation,
  validateTaskUpdate,
  validateMongoId,
  validatePagination,
  validateComment,
  handleValidationErrors,
} from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private (Team Members of the project)
 */
router.post(
  '/',
  authenticate,
  validateTaskCreation,
  handleValidationErrors,
  createTask
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validatePagination,
  handleValidationErrors,
  getTasks
);

/**
 * @route   GET /api/tasks/my-tasks
 * @desc    Get current user's assigned tasks
 * @access  Private
 */
router.get(
  '/my-tasks',
  authenticate,
  validatePagination,
  handleValidationErrors,
  getMyTasks
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateMongoId('id'),
  handleValidationErrors,
  getTaskById
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private (Admin, Project Manager, Assigned User, Task Creator)
 */
router.put(
  '/:id',
  authenticate,
  validateMongoId('id'),
  validateTaskUpdate,
  handleValidationErrors,
  updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private (Admin, Project Manager, Task Creator)
 */
router.delete(
  '/:id',
  authenticate,
  validateMongoId('id'),
  handleValidationErrors,
  deleteTask
);

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add comment to task
 * @access  Private (Team Members of the project)
 */
router.post(
  '/:id/comments',
  authenticate,
  validateMongoId('id'),
  validateComment,
  handleValidationErrors,
  addComment
);

export default router;