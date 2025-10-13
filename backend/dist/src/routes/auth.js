"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', validation_1.validateUserRegistration, validation_1.handleValidationErrors, authController_1.register);
router.post('/login', validation_1.validateUserLogin, validation_1.handleValidationErrors, authController_1.login);
router.post('/refresh', authController_1.refreshToken);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
router.put('/profile', auth_1.authenticate, validation_1.validateUserUpdate, validation_1.handleValidationErrors, authController_1.updateProfile);
router.put('/change-password', auth_1.authenticate, authController_1.changePassword);
router.post('/logout', auth_1.authenticate, authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map