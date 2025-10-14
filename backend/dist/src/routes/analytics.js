"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_1.authenticate, analyticsController_1.getDashboardAnalytics);
router.get('/projects', auth_1.authenticate, analyticsController_1.getProjectAnalytics);
router.get('/team', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.ADMIN), analyticsController_1.getTeamAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.js.map