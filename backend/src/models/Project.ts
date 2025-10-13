import mongoose, { Document, Schema } from 'mongoose';

/**
 * Project priority levels
 */
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Project status types
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

/**
 * Project interface extending Document
 */
export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  deadline: Date;
  priority: ProjectPriority;
  status: ProjectStatus;
  managerId: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  budget?: number;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project schema definition
 */
const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Project title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [2000, 'Project description cannot exceed 2000 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Project deadline is required'],
      validate: {
        validator: function (deadline: Date) {
          return deadline > new Date();
        },
        message: 'Project deadline must be in the future',
      },
    },
    priority: {
      type: String,
      enum: Object.values(ProjectPriority),
      default: ProjectPriority.MEDIUM,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PLANNING,
      required: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project manager is required'],
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
    },
    actualHours: {
      type: Number,
      min: [0, 'Actual hours cannot be negative'],
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters'],
      },
    ],
    attachments: [
      {
        type: String, // File paths or URLs
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc: any, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Indexes for performance
 */
ProjectSchema.index({ title: 'text', description: 'text' });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ priority: 1 });
ProjectSchema.index({ deadline: 1 });
ProjectSchema.index({ managerId: 1 });
ProjectSchema.index({ teamMembers: 1 });
ProjectSchema.index({ createdAt: -1 });

/**
 * Virtual for getting completion percentage
 */
ProjectSchema.virtual('completionPercentage').get(function () {
  if (this.status === ProjectStatus.COMPLETED) return 100;
  if (this.status === ProjectStatus.CANCELLED) return 0;
  
  // This would be calculated based on tasks completion in real scenario
  // For now, returning a basic calculation
  switch (this.status) {
    case ProjectStatus.PLANNING:
      return 10;
    case ProjectStatus.IN_PROGRESS:
      return 50;
    case ProjectStatus.TESTING:
      return 80;
    default:
      return 0;
  }
});

/**
 * Project model
 */
export const Project = mongoose.model<IProject>('Project', ProjectSchema);