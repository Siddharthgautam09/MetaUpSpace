"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTeamMembership = exports.checkResourceOwnership = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
            return;
        }
        const token = authHeader.substring(7);
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Invalid token or user not found',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Authentication error',
            });
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.substring(7);
        if (!token) {
            next();
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const checkResourceOwnership = (resourceUserField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (req.user.role === User_1.UserRole.ADMIN || req.user.role === User_1.UserRole.MANAGER) {
            next();
            return;
        }
        const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];
        if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                message: 'Access denied - insufficient permissions',
            });
            return;
        }
        next();
    };
};
exports.checkResourceOwnership = checkResourceOwnership;
const checkTeamMembership = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (req.user.role === User_1.UserRole.ADMIN) {
            next();
            return;
        }
        const projectId = req.params.projectId || req.body.projectId;
        if (!projectId) {
            res.status(400).json({
                success: false,
                message: 'Project ID is required',
            });
            return;
        }
        const { Project } = await Promise.resolve().then(() => __importStar(require('../models/Project')));
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found',
            });
            return;
        }
        const isManager = project.managerId.toString() === req.user._id.toString();
        const isTeamMember = project.teamMembers.some((memberId) => memberId.toString() === req.user._id.toString());
        if (!isManager && !isTeamMember) {
            res.status(403).json({
                success: false,
                message: 'Access denied - not a team member',
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating team membership',
        });
    }
};
exports.checkTeamMembership = checkTeamMembership;
//# sourceMappingURL=auth.js.map