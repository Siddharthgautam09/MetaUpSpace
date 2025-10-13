import mongoose, { Document, Schema } from 'mongoose';

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Task status types
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

/**
 * Task interface extending Document
 */
export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  dependencies: mongoose.Types.ObjectId[];
  comments: {
    userId: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
  }[];
  completedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task schema definition
 */
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Task due date is required'],
      validate: {
        validator: function (dueDate: Date) {
          return dueDate > new Date();
        },
        message: 'Task due date must be in the future',
      },
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
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedAt: {
      type: Date,
    },
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
 * Pre-save middleware to set completedAt when status changes to completed
 */
TaskSchema.pre('save', function (next: any) {
  if (this.isModified('status')) {
    if (this.status === TaskStatus.COMPLETED && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== TaskStatus.COMPLETED) {
      this.completedAt = undefined;
    }
  }
  next();
});

/**
 * Indexes for performance
 */
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ createdAt: -1 });

/**
 * Virtual for checking if task is overdue
 */
TaskSchema.virtual('isOverdue').get(function () {
  return this.status !== TaskStatus.COMPLETED && new Date() > this.dueDate;
});

/**
 * Task model
 */
export const Task = mongoose.model<ITask>('Task', TaskSchema);