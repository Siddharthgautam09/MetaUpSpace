"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskStatus = exports.TaskPriority = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["REVIEW"] = "review";
    TaskStatus["TESTING"] = "testing";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["BLOCKED"] = "blocked";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
const TaskSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required'],
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (dueDate) {
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
            type: String,
        },
    ],
    dependencies: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Task',
        },
    ],
    comments: [
        {
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
TaskSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === TaskStatus.COMPLETED && !this.completedAt) {
            this.completedAt = new Date();
        }
        else if (this.status !== TaskStatus.COMPLETED) {
            this.completedAt = undefined;
        }
    }
    next();
});
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.virtual('isOverdue').get(function () {
    return this.status !== TaskStatus.COMPLETED && new Date() > this.dueDate;
});
exports.Task = mongoose_1.default.model('Task', TaskSchema);
//# sourceMappingURL=Task.js.map