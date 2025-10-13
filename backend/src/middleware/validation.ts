import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { UserRole } from '../models/User';
import { ProjectPriority, ProjectStatus } from '../models/Project';
import { TaskPriority, TaskStatus } from '../models/Task';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  
  next();
};

/**
 * User validation rules
 */
export const validateUserRegistration: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
];

export const validateUserLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateUserUpdate: ValidationChain[] = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
];

/**
 * Project validation rules
 */
export const validateProjectCreation: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Project title must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Project description must be between 1 and 2000 characters'),
  
  body('deadline')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Project deadline must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(Object.values(ProjectPriority))
    .withMessage('Invalid priority level'),
  
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage('Invalid status'),
  
  body('managerId')
    .isMongoId()
    .withMessage('Invalid manager ID'),
  
  body('teamMembers')
    .optional()
    .isArray()
    .withMessage('Team members must be an array')
    .custom((teamMembers) => {
      if (teamMembers && !teamMembers.every((id: any) => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All team member IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
  
  body('budget')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        throw new Error('Budget cannot be negative');
      }
      return true;
    }),
  
  body('estimatedHours')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        throw new Error('Estimated hours cannot be negative');
      }
      return true;
    }),
];

export const validateProjectUpdate: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Project title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Project description must be between 1 and 2000 characters'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Project deadline must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(Object.values(ProjectPriority))
    .withMessage('Invalid priority level'),
  
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage('Invalid status'),
  
  body('managerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid manager ID'),
  
  body('teamMembers')
    .optional()
    .isArray()
    .withMessage('Team members must be an array')
    .custom((teamMembers) => {
      if (teamMembers && !teamMembers.every((id: any) => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All team member IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
  
  body('budget')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        throw new Error('Budget cannot be negative');
      }
      return true;
    }),
  
  body('estimatedHours')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        throw new Error('Estimated hours cannot be negative');
      }
      return true;
    }),
];

/**
 * Task validation rules
 */
export const validateTaskCreation: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Task description must be between 1 and 2000 characters'),
  
  body('projectId')
    .isMongoId()
    .withMessage('Invalid project ID'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  
  body('dueDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Task due date must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid priority level'),
  
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid status'),
  
  body('estimatedHours')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        throw new Error('Estimated hours cannot be negative');
      }
      return true;
    }),
  
  body('dependencies')
    .optional()
    .isArray()
    .withMessage('Dependencies must be an array')
    .custom((dependencies) => {
      if (dependencies && !dependencies.every((id: any) => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All dependency IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
];

export const validateTaskUpdate: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Task description must be between 1 and 2000 characters'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Task due date must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid priority level'),
  
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid status'),
  
  body('estimatedHours')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        throw new Error('Estimated hours cannot be negative');
      }
      return true;
    }),
  
  body('actualHours')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < 0) {
        throw new Error('Actual hours cannot be negative');
      }
      return true;
    }),
  
  body('dependencies')
    .optional()
    .isArray()
    .withMessage('Dependencies must be an array')
    .custom((dependencies) => {
      if (dependencies && !dependencies.every((id: any) => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All dependency IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
];

/**
 * Common validation rules
 */
export const validateMongoId = (field: string = 'id'): ValidationChain => {
  return param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`);
};

export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either "asc" or "desc"'),
];

/**
 * Comment validation
 */
export const validateComment: ValidationChain[] = [
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];