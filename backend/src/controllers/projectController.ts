import { Request, Response } from 'express';
import { Project, IProject, ProjectStatus, ProjectPriority } from '../models/Project';
import { User, UserRole } from '../models/User';
import { Task } from '../models/Task';
import { AuthenticatedRequest } from '../middleware/auth';
import mongoose from 'mongoose';

/**
 * Create a new project
 */
export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Only admins and managers can create projects
    if (user.role === UserRole.TEAM_MEMBER) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create projects',
      });
      return;
    }

    const {
      title,
      description,
      deadline,
      priority,
      status,
      managerId,
      teamMembers,
      budget,
      estimatedHours,
      tags,
    } = req.body;

    // Verify manager exists and has appropriate role
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== UserRole.ADMIN) {
      res.status(400).json({
        success: false,
        message: 'Invalid manager ID or user is not an admin',
      });
      return;
    }

    // Verify team members exist
    if (teamMembers && teamMembers.length > 0) {
      const members = await User.find({ _id: { $in: teamMembers }, isActive: true });
      if (members.length !== teamMembers.length) {
        res.status(400).json({
          success: false,
          message: 'One or more team members not found or inactive',
        });
        return;
      }
    }

    const project = new Project({
      title,
      description,
      deadline,
      priority: priority || ProjectPriority.MEDIUM,
      status: status || ProjectStatus.PLANNING,
      managerId,
      teamMembers: teamMembers || [],
      budget,
      estimatedHours,
      tags: tags || [],
    });

    await project.save();
    
    // Populate the project with manager and team members data
    await project.populate('managerId', 'firstName lastName email role');
    await project.populate('teamMembers', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err: any) => err.message),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Project creation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * Get all projects with filtering, sorting, and pagination
 */
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      status,
      priority,
      managerId,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
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
      filter.$text = { $search: search as string };
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    const projects = await Project.find(filter)
      .populate('managerId', 'firstName lastName email role')
      .populate('teamMembers', 'firstName lastName email role')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Project.countDocuments(filter);

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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get project by ID
 */
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('managerId', 'firstName lastName email role')
      .populate('teamMembers', 'firstName lastName email role');

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Get project tasks
    const tasks = await Task.find({ projectId: id })
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update project
 */
export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const project = await Project.findById(id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check permissions
    const canUpdate = user.role === UserRole.ADMIN ||
                     project.managerId.toString() === user._id.toString();

    if (!canUpdate) {
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

    const updates: any = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Verify new manager if managerId is being updated
    if (updates.managerId) {
      const manager = await User.findById(updates.managerId);
      if (!manager || manager.role !== UserRole.ADMIN) {
        res.status(400).json({
          success: false,
          message: 'Invalid manager ID or user is not an admin',
        });
        return;
      }
    }

    // Verify team members if being updated
    if (updates.teamMembers) {
      const members = await User.find({ _id: { $in: updates.teamMembers }, isActive: true });
      if (members.length !== updates.teamMembers.length) {
        res.status(400).json({
          success: false,
          message: 'One or more team members not found or inactive',
        });
        return;
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('managerId', 'firstName lastName email role')
      .populate('teamMembers', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject,
      },
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err: any) => err.message),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Project update failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * Delete project
 */
export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const project = await Project.findById(id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Only admins and project managers can delete projects
    const canDelete = user.role === UserRole.ADMIN ||
                     project.managerId.toString() === user._id.toString();

    if (!canDelete) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete this project',
      });
      return;
    }

    // Check if project has active tasks
    const activeTasks = await Task.countDocuments({
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

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Project deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get project statistics
 */
export const getProjectStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalActualHours: { $sum: '$actualHours' },
        },
      },
    ]);

    // Get team member workload
    const teamWorkload = await Task.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(id), assignedTo: { $exists: true } } },
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

    const totalTasks = await Task.countDocuments({ projectId: id });
    const completedTasks = await Task.countDocuments({ projectId: id, status: 'completed' });
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};