import { Request, Response } from 'express';
import { Task, ITask, TaskStatus, TaskPriority } from '../models/Task';
import { Project } from '../models/Project';
import { User, UserRole } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import mongoose from 'mongoose';

/**
 * Create a new task
 */
export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const {
      title,
      description,
      projectId,
      assignedTo,
      dueDate,
      priority,
      status,
      estimatedHours,
      tags,
      dependencies,
    } = req.body;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check if user can create tasks for this project
    const canCreate = user.role === UserRole.ADMIN ||
                     project.managerId.toString() === user._id.toString() ||
                     project.teamMembers.some(memberId => memberId.toString() === user._id.toString());

    if (!canCreate) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create tasks for this project',
      });
      return;
    }

    // Verify assigned user if provided
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || !assignedUser.isActive) {
        res.status(400).json({
          success: false,
          message: 'Assigned user not found or inactive',
        });
        return;
      }

      // Check if assigned user is part of the project team
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

    // Verify dependencies if provided
    if (dependencies && dependencies.length > 0) {
      const dependencyTasks = await Task.find({ _id: { $in: dependencies }, projectId });
      if (dependencyTasks.length !== dependencies.length) {
        res.status(400).json({
          success: false,
          message: 'One or more dependency tasks not found in the same project',
        });
        return;
      }
    }

    const task = new Task({
      title,
      description,
      projectId,
      assignedTo,
      createdBy: user._id,
      dueDate,
      priority: priority || TaskPriority.MEDIUM,
      status: status || TaskStatus.TODO,
      estimatedHours,
      tags: tags || [],
      dependencies: dependencies || [],
    });

    await task.save();
    
    // Populate the task with related data
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
        message: 'Task creation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * Get all tasks with filtering, sorting, and pagination
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      status,
      priority,
      projectId,
      assignedTo,
      createdBy,
      search,
      overdue,
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
      filter.$text = { $search: search as string };
    }

    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: TaskStatus.COMPLETED };
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(filter)
      .populate('projectId', 'title status')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('dependencies', 'title status')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(filter);

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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get task by ID
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update task
 */
export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const task = await Task.findById(id).populate('projectId');
    
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const project = task.projectId as any;

    // Check permissions
    const canUpdate = user.role === UserRole.ADMIN ||
                     project.managerId.toString() === user._id.toString() ||
                     task.assignedTo?.toString() === user._id.toString() ||
                     task.createdBy.toString() === user._id.toString();

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

    const updates: any = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Verify assigned user if being updated
    if (updates.assignedTo) {
      const assignedUser = await User.findById(updates.assignedTo);
      if (!assignedUser || !assignedUser.isActive) {
        res.status(400).json({
          success: false,
          message: 'Assigned user not found or inactive',
        });
        return;
      }

      // Check if assigned user is part of the project team
      const isTeamMember = project.managerId.toString() === updates.assignedTo ||
                          project.teamMembers.some((memberId: any) => memberId.toString() === updates.assignedTo);

      if (!isTeamMember) {
        res.status(400).json({
          success: false,
          message: 'Assigned user is not part of the project team',
        });
        return;
      }
    }

    // Verify dependencies if being updated
    if (updates.dependencies) {
      const dependencyTasks = await Task.find({ _id: { $in: updates.dependencies }, projectId: task.projectId });
      if (dependencyTasks.length !== updates.dependencies.length) {
        res.status(400).json({
          success: false,
          message: 'One or more dependency tasks not found in the same project',
        });
        return;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
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
        message: 'Task update failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * Delete task
 */
export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const task = await Task.findById(id).populate('projectId');
    
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const project = task.projectId as any;

    // Check permissions - Only admins, project managers, and task creators can delete
    const canDelete = user.role === UserRole.ADMIN ||
                     project.managerId.toString() === user._id.toString() ||
                     task.createdBy.toString() === user._id.toString();

    if (!canDelete) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete this task',
      });
      return;
    }

    // Check if other tasks depend on this task
    const dependentTasks = await Task.find({ dependencies: id });
    
    if (dependentTasks.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete task that has dependent tasks. Please remove dependencies first.',
        dependentTasks: dependentTasks.map(t => ({ id: t._id, title: t.title })),
      });
      return;
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Task deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Add comment to task
 */
export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const task = await Task.findById(id).populate('projectId');
    
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const project = task.projectId as any;

    // Check if user can comment on this task (must be project team member)
    const canComment = user.role === UserRole.ADMIN ||
                      project.managerId.toString() === user._id.toString() ||
                      project.teamMembers.some((memberId: any) => memberId.toString() === user._id.toString()) ||
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

    // Populate the new comment with user data
    await task.populate('comments.userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: task.comments[task.comments.length - 1],
      },
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get user's assigned tasks
 */
export const getMyTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const {
      page = 1,
      limit = 10,
      sort = 'dueDate',
      order = 'asc',
      status,
      priority,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = { assignedTo: user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(filter)
      .populate('projectId', 'title status')
      .populate('createdBy', 'firstName lastName email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(filter);

    // Get overdue tasks count
    const overdueTasks = await Task.countDocuments({
      assignedTo: user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED }
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};