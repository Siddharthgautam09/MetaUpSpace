import { Request, Response, NextFunction } from 'express';
import { UserRole, IUser } from '../models/User';
export interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkResourceOwnership: (resourceUserField?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const checkTeamMembership: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map