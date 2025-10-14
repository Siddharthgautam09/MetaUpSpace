import { Request, Response } from 'express';
import { Project, ProjectStatus } from '../models/Project';
import { Task, TaskStatus } from '../models/Task';
import { User, UserRole } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import mongoose from 'mongoose';

/**
 * Get dashboard analytics
 */
export const getDashboardAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Build filter based on user role
    let projectFilter: any = {};
    let taskFilter: any = {};

    if (user.role === UserRole.TEAM_MEMBER) {
      // Team members see only projects they're assigned to
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
    // Admins see everything (no filter)

    // Get project statistics
    const projectStats = await Project.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
        }
      }
    ]);

    // Get task statistics
    const taskStats = await Task.aggregate([
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

    // Get priority distribution
    const priorityStats = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get team member workload (for admins)
    let teamWorkload = [];
    if (user.role !== UserRole.TEAM_MEMBER) {
      const workloadFilter = {};

      teamWorkload = await Task.aggregate([
        { $match: { ...workloadFilter, assignedTo: { $exists: true } } },
        {
          $group: {
            _id: '$assignedTo',
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', TaskStatus.COMPLETED] }, 1, 0] }
            },
            inProgressTasks: {
              $sum: { $cond: [{ $eq: ['$status', TaskStatus.IN_PROGRESS] }, 1, 0] }
            },
            overdueTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', TaskStatus.COMPLETED] }
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

    // Get recent activity
    const recentTasks = await Task.find(taskFilter)
      .populate('projectId', 'title')
      .populate('assignedTo', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title status priority dueDate updatedAt');

    // Get overdue tasks count
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED }
    });

    // Calculate totals
    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: TaskStatus.COMPLETED });

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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get project analytics
 */
export const getProjectAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    // Projects created over time
    const projectsOverTime = await Project.aggregate([
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

    // Project completion rates
    const completionRates = await Project.aggregate([
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
                cond: { $eq: ['$$this.status', TaskStatus.COMPLETED] }
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

    // Budget analysis
    const budgetAnalysis = await Project.aggregate([
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get team performance analytics
 */
export const getTeamAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Only managers and admins can view team analytics
    if (user.role === UserRole.TEAM_MEMBER) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view team analytics',
      });
      return;
    }

    const { startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    // Build project filter based on user role
    let projectIds: any[] = [];
    const allProjects = await Project.find({}).select('_id');
    projectIds = allProjects.map(p => p._id);

    // Team member performance
    const teamPerformance = await Task.aggregate([
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
            $sum: { $cond: [{ $eq: ['$status', TaskStatus.COMPLETED] }, 1, 0] }
          },
          avgCompletionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', TaskStatus.COMPLETED] },
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

    // Task completion trends
    const completionTrends = await Task.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: TaskStatus.COMPLETED,
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};