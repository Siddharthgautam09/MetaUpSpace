import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUserRegistration: ValidationChain[];
export declare const validateUserLogin: ValidationChain[];
export declare const validateUserUpdate: ValidationChain[];
export declare const validateProjectCreation: ValidationChain[];
export declare const validateProjectUpdate: ValidationChain[];
export declare const validateTaskCreation: ValidationChain[];
export declare const validateTaskUpdate: ValidationChain[];
export declare const validateMongoId: (field?: string) => ValidationChain;
export declare const validatePagination: ValidationChain[];
export declare const validateComment: ValidationChain[];
//# sourceMappingURL=validation.d.ts.map