import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration
 */
export const database = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_task_management',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/enterprise_task_management_test',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    },
  },
};

/**
 * JWT configuration
 */
export const jwt = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

/**
 * Server configuration
 */
export const server = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || '/api',
};

/**
 * Security configuration
 */
export const security = {
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

/**
 * CORS configuration
 */
export const cors = {
  origin: true, // Allow all origins for now
  credentials: true,
};

/**
 * Logging configuration
 */
export const logging = {
  level: process.env.LOG_LEVEL || 'info',
};

/**
 * File upload configuration
 */
export const upload = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
};

export default {
  database,
  jwt,
  server,
  security,
  cors,
  logging,
  upload,
};