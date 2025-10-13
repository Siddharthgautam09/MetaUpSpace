import mongoose, { Document } from 'mongoose';
export declare enum ProjectPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ProjectStatus {
    PLANNING = "planning",
    IN_PROGRESS = "in_progress",
    TESTING = "testing",
    COMPLETED = "completed",
    ON_HOLD = "on_hold",
    CANCELLED = "cancelled"
}
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
export declare const Project: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, {}> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Project.d.ts.map