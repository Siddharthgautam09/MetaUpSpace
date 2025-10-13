import mongoose, { Document } from 'mongoose';
export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    TEAM_MEMBER = "team_member"
}
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    profilePicture?: string;
    department?: string;
    phoneNumber?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getFullName(): string;
    toJSON(): any;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map