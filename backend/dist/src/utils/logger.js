"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPerformance = exports.logRequest = exports.logError = exports.morganStream = void 0;
const winston_1 = __importDefault(require("winston"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) {
        logMessage += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
        logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return logMessage;
}));
const transports = [];
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    transports.push(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple(), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
            let logMessage = `${timestamp} [${level}]: ${message}`;
            if (stack) {
                logMessage += `\n${stack}`;
            }
            return logMessage;
        })),
    }));
}
else {
    transports.push(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
    }), new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5,
    }), new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple(), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
            let logMessage = `${timestamp} [${level}]: ${message}`;
            if (stack) {
                logMessage += `\n${stack}`;
            }
            return logMessage;
        })),
    }));
}
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'task-management-api' },
    transports,
});
exports.morganStream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
const logError = (error, context) => {
    logger.error('Error occurred', {
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
        },
        context,
    });
};
exports.logError = logError;
const logRequest = (method, url, userId, duration) => {
    logger.info('API Request', {
        method,
        url,
        userId,
        duration: duration ? `${duration}ms` : undefined,
    });
};
exports.logRequest = logRequest;
const logPerformance = (operation, duration, metadata) => {
    logger.info('Performance Log', {
        operation,
        duration: `${duration}ms`,
        ...metadata,
    });
};
exports.logPerformance = logPerformance;
exports.default = logger;
//# sourceMappingURL=logger.js.map