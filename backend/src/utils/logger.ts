import winston from 'winston';

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'task-management-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Add console transport in development
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        let logMessage = `${timestamp} [${level}]: ${message}`;
        if (stack) {
          logMessage += `\n${stack}`;
        }
        return logMessage;
      })
    ),
  }));
}

/**
 * Stream interface for Morgan HTTP logger
 */
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * Error logging helper
 */
export const logError = (error: Error, context?: any) => {
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
  });
};

/**
 * Request logging helper
 */
export const logRequest = (method: string, url: string, userId?: string, duration?: number) => {
  logger.info('API Request', {
    method,
    url,
    userId,
    duration: duration ? `${duration}ms` : undefined,
  });
};

/**
 * Performance logging helper
 */
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('Performance Log', {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

export default logger;