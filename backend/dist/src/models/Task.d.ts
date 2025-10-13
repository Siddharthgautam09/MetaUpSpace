import mongoose, { Document } from 'mongoose';
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    REVIEW = "review",
    TESTING = "testing",
    COMPLETED = "completed",
    BLOCKED = "blocked"
}
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
export declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, {}> & ITask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Task.d.ts.map