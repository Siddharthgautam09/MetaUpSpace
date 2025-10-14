"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamAnalytics = exports.getProjectAnalytics = exports.getDashboardAnalytics = void 0;
const Project_1 = require("../models/Project");
const Task_1 = require("../models/Task");
const User_1 = require("../models/User");
const getDashboardAnalytics = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        let projectFilter = {};
        let taskFilter = {};
        if (user.role === User_1.UserRole.TEAM_MEMBER) {
            projectFilter = {
                $or: [
                    { managerId: user._id },
                    { teamMembers: user._id }
                ]
            };
            taskFilter = {
                $or: [
                    { assignedTo: user._id },
                    { createdBy: user._id }
                ]
            };
        }
        const projectStats = await Project_1.Project.aggregate([
            { $match: projectFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalBudget: { $sum: '$budget' },
                }
            }
        ]);
        const taskStats = await Task_1.Task.aggregate([
            { $match: taskFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalEstimatedHours: { $sum: '$estimatedHours' },
                    totalActualHours: { $sum: '$actualHours' },
                }
            }
        ]);
        const priorityStats = await Task_1.Task.aggregate([
            { $match: taskFilter },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);
        let teamWorkload = [];
        if (user.role !== User_1.UserRole.TEAM_MEMBER) {
            const workloadFilter = {};
            teamWorkload = await Task_1.Task.aggregate([
                { $match: { ...workloadFilter, assignedTo: { $exists: true } } },
                {
                    $group: {
                        _id: '$assignedTo',
                        totalTasks: { $sum: 1 },
                        completedTasks: {
                            $sum: { $cond: [{ $eq: ['$status', Task_1.TaskStatus.COMPLETED] }, 1, 0] }
                        },
                        inProgressTasks: {
                            $sum: { $cond: [{ $eq: ['$status', Task_1.TaskStatus.IN_PROGRESS] }, 1, 0] }
                        },
                        overdueTasks: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $lt: ['$dueDate', new Date()] },
                                            { $ne: ['$status', Task_1.TaskStatus.COMPLETED] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        totalEstimatedHours: { $sum: '$estimatedHours' },
                        totalActualHours: { $sum: '$actualHours' },
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        userId: '$_id',
                        userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                        userEmail: '$user.email',
                        totalTasks: 1,
                        completedTasks: 1,
                        inProgressTasks: 1,
                        overdueTasks: 1,
                        totalEstimatedHours: 1,
                        totalActualHours: 1,
                        completionRate: {
                            $cond: [
                                { $eq: ['$totalTasks', 0] },
                                0,
                                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
                            ]
                        }
                    }
                },
                { $sort: { totalTasks: -1 } }
            ]);
        }
        const recentTasks = await Task_1.Task.find(taskFilter)
            .populate('projectId', 'title')
            .populate('assignedTo', 'firstName lastName')
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('title status priority dueDate updatedAt');
        const overdueTasks = await Task_1.Task.countDocuments({
            ...taskFilter,
            dueDate: { $lt: new Date() },
            status: { $ne: Task_1.TaskStatus.COMPLETED }
        });
        const totalProjects = await Project_1.Project.countDocuments(projectFilter);
        const totalTasks = await Task_1.Task.countDocuments(taskFilter);
        const completedTasks = await Task_1.Task.countDocuments({ ...taskFilter, status: Task_1.TaskStatus.COMPLETED });
        res.status(200).json({
            success: true,
            message: 'Dashboard analytics retrieved successfully',
            data: {
                overview: {
                    totalProjects,
                    totalTasks,
                    completedTasks,
                    overdueTasks,
                    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                },
                projectStats,
                taskStats,
                priorityStats,
                teamWorkload,
                recentActivity: recentTasks,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const getProjectAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        const projectsOverTime = await Project_1.Project.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        const completionRates = await Project_1.Project.aggregate([
            { $match: dateFilter },
            {
                $lookup: {
                    from: 'tasks',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'tasks'
                }
            },
            {
                $project: {
                    title: 1,
                    status: 1,
                    totalTasks: { $size: '$tasks' },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: '$tasks',
                                cond: { $eq: ['$$this.status', Task_1.TaskStatus.COMPLETED] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    title: 1,
                    status: 1,
                    totalTasks: 1,
                    completedTasks: 1,
                    completionRate: {
                        $cond: [
                            { $eq: ['$totalTasks', 0] },
                            0,
                            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { completionRate: -1 } }
        ]);
        const budgetAnalysis = await Project_1.Project.aggregate([
            { $match: { ...dateFilter, budget: { $exists: true, $gt: 0 } } },
            {
                $group: {
                    _id: '$status',
                    totalBudget: { $sum: '$budget' },
                    avgBudget: { $avg: '$budget' },
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json({
            success: true,
            message: 'Project analytics retrieved successfully',
            data: {
                projectsOverTime,
                completionRates,
                budgetAnalysis,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getProjectAnalytics = getProjectAnalytics;
const getTeamAnalytics = async (req, res) => {
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
                message: 'Insufficient permissions to view team analytics',
            });
            return;
        }
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        let projectIds = [];
        const allProjects = await Project_1.Project.find({}).select('_id');
        projectIds = allProjects.map(p => p._id);
        const teamPerformance = await Task_1.Task.aggregate([
            {
                $match: {
                    ...dateFilter,
                    assignedTo: { $exists: true },
                    projectId: { $in: projectIds }
                }
            },
            {
                $group: {
                    _id: '$assignedTo',
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', Task_1.TaskStatus.COMPLETED] }, 1, 0] }
                    },
                    avgCompletionTime: {
                        $avg: {
                            $cond: [
                                { $eq: ['$status', Task_1.TaskStatus.COMPLETED] },
                                { $subtract: ['$completedAt', '$createdAt'] },
                                null
                            ]
                        }
                    },
                    totalEstimatedHours: { $sum: '$estimatedHours' },
                    totalActualHours: { $sum: '$actualHours' },
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    userId: '$_id',
                    userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                    userEmail: '$user.email',
                    userRole: '$user.role',
                    totalTasks: 1,
                    completedTasks: 1,
                    completionRate: {
                        $cond: [
                            { $eq: ['$totalTasks', 0] },
                            0,
                            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
                        ]
                    },
                    avgCompletionTimeInDays: {
                        $cond: [
                            { $eq: ['$avgCompletionTime', null] },
                            0,
                            { $divide: ['$avgCompletionTime', 1000 * 60 * 60 * 24] }
                        ]
                    },
                    totalEstimatedHours: 1,
                    totalActualHours: 1,
                    efficiency: {
                        $cond: [
                            { $or: [{ $eq: ['$totalEstimatedHours', 0] }, { $eq: ['$totalEstimatedHours', null] }] },
                            100,
                            { $multiply: [{ $divide: ['$totalEstimatedHours', '$totalActualHours'] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { completionRate: -1 } }
        ]);
        const completionTrends = await Task_1.Task.aggregate([
            {
                $match: {
                    ...dateFilter,
                    status: Task_1.TaskStatus.COMPLETED,
                    projectId: { $in: projectIds }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$completedAt' },
                        month: { $month: '$completedAt' },
                        week: { $week: '$completedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
        ]);
        res.status(200).json({
            success: true,
            message: 'Team analytics retrieved successfully',
            data: {
                teamPerformance,
                completionTrends,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve team analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
exports.getTeamAnalytics = getTeamAnalytics;
//# sourceMappingURL=analyticsController.js.map