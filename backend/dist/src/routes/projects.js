"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), validation_1.validateProjectCreation, validation_1.handleValidationErrors, projectController_1.createProject);
router.get('/', auth_1.authenticate, validation_1.validatePagination, validation_1.handleValidationErrors, projectController_1.getProjects);
router.get('/:id', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.handleValidationErrors, projectController_1.getProjectById);
router.put('/:id', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.validateProjectUpdate, validation_1.handleValidationErrors, projectController_1.updateProject);
router.delete('/:id', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.handleValidationErrors, projectController_1.deleteProject);
router.get('/:id/stats', auth_1.authenticate, (0, validation_1.validateMongoId)('id'), validation_1.handleValidationErrors, projectController_1.getProjectStats);
exports.default = router;
//# sourceMappingURL=projects.js.map