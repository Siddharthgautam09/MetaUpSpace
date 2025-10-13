import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const createTask: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTasks: (req: Request, res: Response) => Promise<void>;
export declare const getTaskById: (req: Request, res: Response) => Promise<void>;
export declare const updateTask: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteTask: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const addComment: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMyTasks: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=taskController.d.ts.map