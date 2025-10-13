"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, validation_1.validateTaskCreation, validation_1.handleValidationErrors, taskController_1.createTask);
router.get('/', auth_1.authenticate, validation_1.validatePagination, validation_1.handleValidationErrors, taskController_1.getTasks);
router.get('/my-tasks', auth_1.authenticate, validation_1.validatePagination, validation_1.handleValidationErrors, taskController_1.getMyTasks);
router.get('/:id', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.handleValidationErrors, taskController_1.getTaskById);
router.put('/:id', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.validateTaskUpdate, validation_1.handleValidationErrors, taskController_1.updateTask);
router.delete('/:id', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.handleValidationErrors, taskController_1.deleteTask);
router.post('/:id/comments', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.validateComment, validation_1.handleValidationErrors, taskController_1.addComment);
exports.default = router;
//# sourceMappingURL=tasks.js.map