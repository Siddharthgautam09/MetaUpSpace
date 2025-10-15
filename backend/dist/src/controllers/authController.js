"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const generateTokens = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    const accessToken = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    const refreshToken = jsonwebtoken_1.default.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
};
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, department, phoneNumber } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
            return;
        }
        const user = new User_1.User({
            email,
            password,
            firstName,
            lastName,
            role: role || User_1.UserRole.TEAM_MEMBER,
            department,
            phoneNumber,
        });
        await user.save();
        const { accessToken, refreshToken } = generateTokens(user);
        user.lastLoginAt = new Date();
        await user.save();
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
        }
        else if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Registration failed - A server error has occurred',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            });
        }
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        const { accessToken, refreshToken } = generateTokens(user);
        user.lastLoginAt = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret');
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
            return;
        }
        const tokens = generateTokens(user);
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens,
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Token refresh failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
};
exports.refreshToken = refreshToken;
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user: user.toJSON(),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const allowedUpdates = ['firstName', 'lastName', 'department', 'phoneNumber'];
        const updates = {};
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        if (user.role === User_1.UserRole.ADMIN) {
            if (req.body.role !== undefined) {
                updates.role = req.body.role;
            }
            if (req.body.email !== undefined) {
                updates.email = req.body.email;
            }
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser.toJSON(),
            },
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }
        else if (error.code === 11000) {
            res.status(409).json({
                success: false,
                message: 'Email already exists',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Profile update failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const user = req.user;
        const { currentPassword, newPassword } = req.body;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
            return;
        }
        const userWithPassword = await User_1.User.findById(user._id).select('+password');
        if (!userWithPassword) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }
        userWithPassword.password = newPassword;
        await userWithPassword.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Password change failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
};
exports.changePassword = changePassword;
const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout successful. Please remove tokens from client storage.',
    });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map