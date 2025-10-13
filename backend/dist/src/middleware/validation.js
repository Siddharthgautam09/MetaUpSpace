"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateComment = exports.validatePagination = exports.validateMongoId = exports.validateTaskUpdate = exports.validateTaskCreation = exports.validateProjectUpdate = exports.validateProjectCreation = exports.validateUserUpdate = exports.validateUserLogin = exports.validateUserRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const Project_1 = require("../models/Project");
const Task_1 = require("../models/Task");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
exports.handleValidationErrors = handleValidationErrors;
exports.validateUserRegistration = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(Object.values(User_1.UserRole))
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department name cannot exceed 100 characters'),
    (0, express_validator_1.body)('phoneNumber')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
];
exports.validateUserLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
exports.validateUserUpdate = [
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(Object.values(User_1.UserRole))
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department name cannot exceed 100 characters'),
    (0, express_validator_1.body)('phoneNumber')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
];
exports.validateProjectCreation = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Project title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Project description must be between 1 and 2000 characters'),
    (0, express_validator_1.body)('deadline')
        .isISO8601()
        .toDate()
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error('Project deadline must be in the future');
        }
        return true;
    }),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(Object.values(Project_1.ProjectPriority))
        .withMessage('Invalid priority level'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(Project_1.ProjectStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('managerId')
        .isMongoId()
        .withMessage('Invalid manager ID'),
    (0, express_validator_1.body)('teamMembers')
        .optional()
        .isArray()
        .withMessage('Team members must be an array')
        .custom((teamMembers) => {
        if (teamMembers && !teamMembers.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
            throw new Error('All team member IDs must be valid MongoDB ObjectIds');
        }
        return true;
    }),
    (0, express_validator_1.body)('budget')
        .optional()
        .isNumeric()
        .custom((value) => {
        if (value < 0) {
            throw new Error('Budget cannot be negative');
        }
        return true;
    }),
    (0, express_validator_1.body)('estimatedHours')
        .optional()
        .isNumeric()
        .custom((value) => {
        if (value < 0) {
            throw new Error('Estimated hours cannot be negative');
        }
        return true;
    }),
];
exports.validateProjectUpdate = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Project title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Project description must be between 1 and 2000 characters'),
    (0, express_validator_1.body)('deadline')
        .optional()
        .isISO8601()
        .toDate()
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error('Project deadline must be in the future');
        }
        return true;
    }),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(Object.values(Project_1.ProjectPriority))
        .withMessage('Invalid priority level'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(Project_1.ProjectStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('managerId')
        .optional()
        .isMongoId()
        .withMessage('Invalid manager ID'),
    (0, express_validator_1.body)('teamMembers')
        .optional()
        .isArray()
        .withMessage('Team members must be an array')
        .custom((teamMembers) => {
        if (teamMembers && !teamMembers.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
            throw new Error('All team member IDs must be valid MongoDB ObjectIds');
        }
        return true;
    }),
    (0, express_validator_1.body)('budget')
        .optional()
        .isNumeric()
        .custom((value) => {
        if (value < 0) {
            throw new Error('Budget cannot be negative');
        }
        return true;
    }),
    (0, express_validator_1.body)('estimatedHours')
        .optional()
        .isNumeric()
        .custom((value) => {
        if (value < 0) {
            throw new Error('Estimated hours cannot be negative');
        }
        return true;
    }),
];
exports.validateTaskCreation = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Task title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Task description must be between 1 and 2000 characters'),
    (0, express_validator_1.body)('projectId')
        .isMongoId()
        .withMessage('Invalid project ID'),
    (0, express_validator_1.body)('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid assigned user ID'),
    (0, express_validator_1.body)('dueDate')
        .isISO8601()
        .toDate()
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error('Task due date must be in the future');
        }
        return true;
    }),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(Object.values(Task_1.TaskPriority))
        .withMessage('Invalid priority level'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(Task_1.TaskStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('estimatedHours')
        .optional()
        .isNumeric()
        .custom((value) => {
        if (value < 0) {
            throw new Error('Estimated hours cannot be negative');
        }
        return true;
    }),
    (0, express_validator_1.body)('dependencies')
        .optional()
        .isArray()
        .withMessage('Dependencies must be an array')
        .custom((dependencies) => {
        if (dependencies && !dependencies.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
            throw new Error('All dependency IDs must be valid MongoDB ObjectIds');
        }
        return true;
    }),
];
exports.validateTaskUpdate = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Task title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Task description must be between 1 and 2000 characters'),
    (0, express_validator_1.body)('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid assigned user ID'),
    (0, express_validator_1.body)('dueDate')
        .optional()
        .isISO8601()
        .toDate()
        .custom((value) => {
        if (new Date(value) <= new Date()) {
            throw new Error('Task due date must be in the future');
        }
        return true;
    }),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(Object.values(Task_1.TaskPriority))
        .withMessage('Invalid priority level'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(Object.values(Task_1.TaskStatus))
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('estimatedHours')
        .optional()
        .isNumeric()
        .custom((value) => {
        if (value < 0) {
            throw new Error('Estimated hours cannot be negative');
        }
        return true;
    }),
    (0, express_validator_1.body)('actualHours')
        .optional()
        .isNumeric()
        .custom((value) => {
        if (value < 0) {
            throw new Error('Actual hours cannot be negative');
        }
        return true;
    }),
    (0, express_validator_1.body)('dependencies')
        .optional()
        .isArray()
        .withMessage('Dependencies must be an array')
        .custom((dependencies) => {
        if (dependencies && !dependencies.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
            throw new Error('All dependency IDs must be valid MongoDB ObjectIds');
        }
        return true;
    }),
];
const validateMongoId = (field = 'id') => {
    return (0, express_validator_1.param)(field)
        .isMongoId()
        .withMessage(`Invalid ${field}`);
};
exports.validateMongoId = validateMongoId;
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('sort')
        .optional()
        .isString()
        .withMessage('Sort must be a string'),
    (0, express_validator_1.query)('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be either "asc" or "desc"'),
];
exports.validateComment = [
    (0, express_validator_1.body)('comment')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),
];
//# sourceMappingURL=validation.js.map