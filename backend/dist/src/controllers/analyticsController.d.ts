import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const getDashboardAnalytics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProjectAnalytics: (req: Request, res: Response) => Promise<void>;
export declare const getTeamAnalytics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=analyticsController.d.ts.map