import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const createProject: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProjectById: (req: Request, res: Response) => Promise<void>;
export declare const updateProject: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteProject: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProjectStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=projectController.d.ts.map