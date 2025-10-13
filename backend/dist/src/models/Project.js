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
exports.Project = exports.ProjectStatus = exports.ProjectPriority = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ProjectPriority;
(function (ProjectPriority) {
    ProjectPriority["LOW"] = "low";
    ProjectPriority["MEDIUM"] = "medium";
    ProjectPriority["HIGH"] = "high";
    ProjectPriority["CRITICAL"] = "critical";
})(ProjectPriority || (exports.ProjectPriority = ProjectPriority = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "planning";
    ProjectStatus["IN_PROGRESS"] = "in_progress";
    ProjectStatus["TESTING"] = "testing";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["ON_HOLD"] = "on_hold";
    ProjectStatus["CANCELLED"] = "cancelled";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
const ProjectSchema = new mongoose_1.Schema({
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
            validator: function (deadline) {
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project manager is required'],
    },
    teamMembers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
            type: String,
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
ProjectSchema.index({ title: 'text', description: 'text' });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ priority: 1 });
ProjectSchema.index({ deadline: 1 });
ProjectSchema.index({ managerId: 1 });
ProjectSchema.index({ teamMembers: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.virtual('completionPercentage').get(function () {
    if (this.status === ProjectStatus.COMPLETED)
        return 100;
    if (this.status === ProjectStatus.CANCELLED)
        return 0;
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
exports.Project = mongoose_1.default.model('Project', ProjectSchema);
//# sourceMappingURL=Project.js.map