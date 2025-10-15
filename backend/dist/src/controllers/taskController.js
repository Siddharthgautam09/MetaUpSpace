"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTasks = exports.addComment = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const Task_1 = require("../models/Task");
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
const createTask = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const { title, description, projectId, assignedTo, dueDate, priority, status, estimatedHours, tags, dependencies, } = req.body;
        const project = await Project_1.Project.findById(projectId);
        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found',
            });
            return;
        }
        const canCreate = user.role === User_1.UserRole.ADMIN ||
            project.managerId.toString() === user._id.toString();
        if (!canCreate) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create tasks for this project',
            });
            return;
        }
        if (assignedTo) {
            const assignedUser = await User_1.User.findById(assignedTo);
            if (!assignedUser || !assignedUser.isActive) {
                res.status(400).json({
                    success: false,
                    message: 'Assigned user not found or inactive',
                });
                return;
            }
            const isTeamMember = project.managerId.toString() === assignedTo ||
                project.teamMembers.some(memberId => memberId.toString() === assignedTo);
            if (!isTeamMember) {
                res.status(400).json({
                    success: false,
                    message: 'Assigned user is not part of the project team',
                });
                return;
            }
        }
        if (dependencies && dependencies.length > 0) {
            const dependencyTasks = await Task_1.Task.find({ _id: { $in: dependencies }, projectId });
            if (dependencyTasks.length !== dependencies.length) {
                res.status(400).json({
                    success: false,
                    message: 'One or more dependency tasks not found in the same project',
                });
                return;
            }
        }
        const task = new Task_1.Task({
            title,
            description,
            projectId,
            assignedTo,
            createdBy: user._id,
            dueDate,
            priority: priority || Task_1.TaskPriority.MEDIUM,
            status: status || Task_1.TaskStatus.TODO,
            estimatedHours,
            tags: tags || [],
            dependencies: dependencies || [],
        });
        await task.save();
        await task.populate('projectId', 'title');
        await task.populate('assignedTo', 'firstName lastName email');
        await task.populate('createdBy', 'firstName lastName email');
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: {
                task,
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
                message: 'Task creation failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status, priority, projectId, assignedTo, createdBy, search, overdue, } = req.query;
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
        if (projectId) {
            filter.projectId = projectId;
        }
        if (assignedTo) {
            filter.assignedTo = assignedTo;
        }
        if (createdBy) {
            filter.createdBy = createdBy;
        }
        if (search) {
            filter.$text = { $search: search };
        }
        if (overdue === 'true') {
            filter.dueDate = { $lt: new Date() };
            filter.status = { $ne: Task_1.TaskStatus.COMPLETED };
        }
        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;
        const tasks = await Task_1.Task.find(filter)
            .populate('projectId', 'title status')
            .populate('assignedTo', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .populate('dependencies', 'title status')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);
        const total = await Task_1.Task.countDocuments(filter);
        res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: {
                tasks,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalTasks: total,
                    limit: limitNum,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_1.Task.findById(id)
            .populate('projectId', 'title status managerId teamMembers')
            .populate('assignedTo', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .populate('dependencies', 'title status dueDate')
            .populate('comments.userId', 'firstName lastName email');
        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Task retrieved successfully',
            data: {
                task,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res) => {
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
        const task = await Task_1.Task.findById(id).populate('projectId');
        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        const project = task.projectId;
        const isTeamMember = Array.isArray(project.teamMembers) && project.teamMembers.some((memberId) => memberId.toString() === user._id.toString());
        const canUpdate = user.role === User_1.UserRole.ADMIN ||
            project.managerId.toString() === user._id.toString() ||
            task.assignedTo?.toString() === user._id.toString() ||
            task.createdBy.toString() === user._id.toString() ||
            isTeamMember;
        if (!canUpdate) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to update this task',
            });
            return;
        }
        const allowedUpdates = [
            'title', 'description', 'assignedTo', 'dueDate', 'priority',
            'status', 'estimatedHours', 'actualHours', 'tags', 'dependencies'
        ];
        const updates = {};
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        if (updates.assignedTo) {
            const assignedUser = await User_1.User.findById(updates.assignedTo);
            if (!assignedUser || !assignedUser.isActive) {
                res.status(400).json({
                    success: false,
                    message: 'Assigned user not found or inactive',
                });
                return;
            }
            const isTeamMember = project.managerId.toString() === updates.assignedTo ||
                project.teamMembers.some((memberId) => memberId.toString() === updates.assignedTo);
            if (!isTeamMember) {
                res.status(400).json({
                    success: false,
                    message: 'Assigned user is not part of the project team',
                });
                return;
            }
        }
        if (updates.dependencies) {
            const dependencyTasks = await Task_1.Task.find({ _id: { $in: updates.dependencies }, projectId: task.projectId });
            if (dependencyTasks.length !== updates.dependencies.length) {
                res.status(400).json({
                    success: false,
                    message: 'One or more dependency tasks not found in the same project',
                });
                return;
            }
        }
        const updatedTask = await Task_1.Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
            .populate('projectId', 'title status')
            .populate('assignedTo', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .populate('dependencies', 'title status');
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: {
                task: updatedTask,
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
                message: 'Task update failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
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
        const task = await Task_1.Task.findById(id).populate('projectId');
        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        const project = task.projectId;
        const canDelete = user.role === User_1.UserRole.ADMIN ||
            project.managerId.toString() === user._id.toString() ||
            task.createdBy.toString() === user._id.toString();
        if (!canDelete) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to delete this task',
            });
            return;
        }
        const dependentTasks = await Task_1.Task.find({ dependencies: id });
        if (dependentTasks.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete task that has dependent tasks. Please remove dependencies first.',
                dependentTasks: dependentTasks.map(t => ({ id: t._id, title: t.title })),
            });
            return;
        }
        await Task_1.Task.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Task deletion failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.deleteTask = deleteTask;
const addComment = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { comment } = req.body;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        if (!comment || comment.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Comment content is required',
            });
            return;
        }
        const task = await Task_1.Task.findById(id).populate('projectId');
        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        const project = task.projectId;
        const canComment = user.role === User_1.UserRole.ADMIN ||
            project.managerId.toString() === user._id.toString() ||
            project.teamMembers.some((memberId) => memberId.toString() === user._id.toString()) ||
            task.assignedTo?.toString() === user._id.toString();
        if (!canComment) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to comment on this task',
            });
            return;
        }
        task.comments.push({
            userId: user._id,
            comment: comment.trim(),
            createdAt: new Date(),
        });
        await task.save();
        await task.populate('comments.userId', 'firstName lastName email');
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                comment: task.comments[task.comments.length - 1],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.addComment = addComment;
const getMyTasks = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const { page = 1, limit = 10, sort = 'dueDate', order = 'asc', status, priority, } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const filter = { assignedTo: user._id };
        if (status) {
            filter.status = status;
        }
        if (priority) {
            filter.priority = priority;
        }
        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;
        const tasks = await Task_1.Task.find(filter)
            .populate('projectId', 'title status')
            .populate('createdBy', 'firstName lastName email')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);
        const total = await Task_1.Task.countDocuments(filter);
        const overdueTasks = await Task_1.Task.countDocuments({
            assignedTo: user._id,
            dueDate: { $lt: new Date() },
            status: { $ne: Task_1.TaskStatus.COMPLETED }
        });
        res.status(200).json({
            success: true,
            message: 'User tasks retrieved successfully',
            data: {
                tasks,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalTasks: total,
                    limit: limitNum,
                },
                summary: {
                    overdueTasks,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getMyTasks = getMyTasks;
//# sourceMappingURL=taskController.js.map