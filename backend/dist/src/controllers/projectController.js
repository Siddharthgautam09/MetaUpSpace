"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStats = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
const Task_1 = require("../models/Task");
const mongoose_1 = __importDefault(require("mongoose"));
const createProject = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        if (user.role === User_1.UserRole.TEAM_MEMBER) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create projects',
            });
            return;
        }
        const { title, description, deadline, priority, status, managerId, teamMembers, budget, estimatedHours, tags, } = req.body;
        const manager = await User_1.User.findById(managerId);
        if (!manager || manager.role !== User_1.UserRole.ADMIN) {
            res.status(400).json({
                success: false,
                message: 'Invalid manager ID or user is not an admin',
            });
            return;
        }
        if (teamMembers && teamMembers.length > 0) {
            const members = await User_1.User.find({ _id: { $in: teamMembers }, isActive: true });
            if (members.length !== teamMembers.length) {
                res.status(400).json({
                    success: false,
                    message: 'One or more team members not found or inactive',
                });
                return;
            }
        }
        const project = new Project_1.Project({
            title,
            description,
            deadline,
            priority: priority || Project_1.ProjectPriority.MEDIUM,
            status: status || Project_1.ProjectStatus.PLANNING,
            managerId: user._id,
            teamMembers: teamMembers || [],
            budget,
            estimatedHours,
            tags: tags || [],
        });
        await project.save();
        await project.populate('managerId', 'firstName lastName email role');
        await project.populate('teamMembers', 'firstName lastName email role');
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: {
                project,
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
        else {
            res.status(500).json({
                success: false,
                message: 'Project creation failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status, priority, managerId, search, } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (priority) {
            filter.priority = priority;
        }
        if (managerId) {
            filter.managerId = managerId;
        }
        if (search) {
            filter.$text = { $search: search };
        }
        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;
        const projects = await Project_1.Project.find(filter)
            .populate('managerId', 'firstName lastName email role')
            .populate('teamMembers', 'firstName lastName email role')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);
        const total = await Project_1.Project.countDocuments(filter);
        res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: {
                projects,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalProjects: total,
                    limit: limitNum,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve projects',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project_1.Project.findById(id)
            .populate('managerId', 'firstName lastName email role')
            .populate('teamMembers', 'firstName lastName email role');
        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found',
            });
            return;
        }
        const tasks = await Task_1.Task.find({ projectId: id })
            .populate('assignedTo', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'Project retrieved successfully',
            data: {
                project,
                tasks,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const project = await Project_1.Project.findById(id);
        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found',
            });
            return;
        }
        const isAdmin = user.role === User_1.UserRole.ADMIN;
        const isProjectManager = project.managerId.toString() === user._id.toString();
        const isTeamMember = project.teamMembers.some((member) => member.toString() === user._id.toString());
        const canFullUpdate = isAdmin || isProjectManager;
        const canUpdateStatus = isAdmin || isProjectManager || isTeamMember;
        if (isTeamMember && !isAdmin && !isProjectManager) {
            const requestedUpdates = Object.keys(req.body);
            const statusOnlyUpdate = requestedUpdates.length === 1 && requestedUpdates[0] === 'status';
            if (!statusOnlyUpdate) {
                res.status(403).json({
                    success: false,
                    message: 'Team members can only update project status',
                });
                return;
            }
        }
        else if (!canFullUpdate) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update this project',
            });
            return;
        }
        const allowedUpdates = [
            'title', 'description', 'deadline', 'priority', 'status',
            'managerId', 'teamMembers', 'budget', 'estimatedHours', 'actualHours', 'tags'
        ];
        const updates = {};
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        if (updates.managerId) {
            const manager = await User_1.User.findById(updates.managerId);
            if (!manager || manager.role !== User_1.UserRole.ADMIN) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid manager ID or user is not an admin',
                });
                return;
            }
        }
        if (updates.teamMembers) {
            const members = await User_1.User.find({ _id: { $in: updates.teamMembers }, isActive: true });
            if (members.length !== updates.teamMembers.length) {
                res.status(400).json({
                    success: false,
                    message: 'One or more team members not found or inactive',
                });
                return;
            }
        }
        const updatedProject = await Project_1.Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
            .populate('managerId', 'firstName lastName email role')
            .populate('teamMembers', 'firstName lastName email role');
        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: {
                project: updatedProject,
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
        else {
            res.status(500).json({
                success: false,
                message: 'Project update failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const project = await Project_1.Project.findById(id);
        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found',
            });
            return;
        }
        const canDelete = user.role === User_1.UserRole.ADMIN ||
            project.managerId.toString() === user._id.toString();
        if (!canDelete) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete this project',
            });
            return;
        }
        const activeTasks = await Task_1.Task.countDocuments({
            projectId: id,
            status: { $nin: ['completed', 'cancelled'] }
        });
        if (activeTasks > 0) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete project with active tasks. Please complete or cancel all tasks first.',
            });
            return;
        }
        await Project_1.Project.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Project deletion failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.deleteProject = deleteProject;
const getProjectStats = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project_1.Project.findById(id);
        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found',
            });
            return;
        }
        const taskStats = await Task_1.Task.aggregate([
            { $match: { projectId: new mongoose_1.default.Types.ObjectId(id) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalEstimatedHours: { $sum: '$estimatedHours' },
                    totalActualHours: { $sum: '$actualHours' },
                },
            },
        ]);
        const teamWorkload = await Task_1.Task.aggregate([
            { $match: { projectId: new mongoose_1.default.Types.ObjectId(id), assignedTo: { $exists: true } } },
            {
                $group: {
                    _id: '$assignedTo',
                    taskCount: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                    },
                    totalEstimatedHours: { $sum: '$estimatedHours' },
                    totalActualHours: { $sum: '$actualHours' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 1,
                    taskCount: 1,
                    completedTasks: 1,
                    totalEstimatedHours: 1,
                    totalActualHours: 1,
                    userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                    userEmail: '$user.email',
                },
            },
        ]);
        const totalTasks = await Task_1.Task.countDocuments({ projectId: id });
        const completedTasks = await Task_1.Task.countDocuments({ projectId: id, status: 'completed' });
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        res.status(200).json({
            success: true,
            message: 'Project statistics retrieved successfully',
            data: {
                project: {
                    id: project._id,
                    title: project.title,
                    status: project.status,
                    completionPercentage,
                },
                taskStats,
                teamWorkload,
                summary: {
                    totalTasks,
                    completedTasks,
                    completionPercentage,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getProjectStats = getProjectStats;
//# sourceMappingURL=projectController.js.map