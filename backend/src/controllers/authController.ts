import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * JWT token generation helper
 */
const generateTokens = (user: IUser) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  const accessToken = jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: jwtExpiresIn } as SignOptions
  );

  const refreshToken = jwt.sign(
    payload,
    jwtRefreshSecret,
    { expiresIn: jwtRefreshExpiresIn } as SignOptions
  );

  return { accessToken, refreshToken };
};

/**
 * User registration
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, department, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.TEAM_MEMBER,
      department,
      phoneNumber,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update last login
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

  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err: any) => err.message),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * User login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update last login
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Token refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
    ) as any;

    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });

  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const updates: any = {};

    // Only allow specific fields to be updated
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Only admins can update role and email
    if (user.role === UserRole.ADMIN) {
      if (req.body.role !== undefined) {
        updates.role = req.body.role;
      }
      if (req.body.email !== undefined) {
        updates.email = req.body.email;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    );

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

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err: any) => err.message),
      });
    } else if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Profile update failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    
    if (!userWithPassword) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
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
        message: 'Password change failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
};

/**
 * Logout (client-side token invalidation)
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove tokens from client storage.',
  });
};