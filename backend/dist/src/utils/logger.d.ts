import winston from 'winston';
declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const logError: (error: Error, context?: any) => void;
export declare const logRequest: (method: string, url: string, userId?: string, duration?: number) => void;
export declare const logPerformance: (operation: string, duration: number, metadata?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map