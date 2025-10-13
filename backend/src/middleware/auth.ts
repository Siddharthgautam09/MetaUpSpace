import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/User';

/**
 * Extended Request interface with user property
 */
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
    
    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid token or user not found',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication error',
      });
    }
  }
};

/**
 * Authorization middleware factory
 * Creates middleware to check if user has required role(s)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
    
    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }

    next();

  } catch (error) {
    // Ignore token errors in optional auth, just continue without user
    next();
  }
};

/**
 * Resource ownership middleware factory
 * Checks if user owns the resource or has admin/manager privileges
 */
export const checkResourceOwnership = (resourceUserField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Admins and Managers can access any resource
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.MANAGER) {
      next();
      return;
    }

    // Check if user owns the resource
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

/**
 * Team member validation middleware
 * Ensures user is a team member of the project
 */
export const checkTeamMembership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Admins can access any project
    if (req.user.role === UserRole.ADMIN) {
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

    // Import Project model here to avoid circular dependency
    const { Project } = await import('../models/Project');
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check if user is project manager or team member
    const isManager = project.managerId.toString() === req.user._id.toString();
    const isTeamMember = project.teamMembers.some(
      (memberId) => memberId.toString() === req.user!._id.toString()
    );

    if (!isManager && !isTeamMember) {
      res.status(403).json({
        success: false,
        message: 'Access denied - not a team member',
      });
      return;
    }

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating team membership',
    });
  }
};