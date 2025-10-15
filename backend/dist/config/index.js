"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.logging = exports.cors = exports.security = exports.server = exports.jwt = exports.database = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.database = {
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
exports.jwt = {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};
exports.server = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    apiPrefix: process.env.API_PREFIX || '/api',
};
exports.security = {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};
exports.cors = {
    origin: '*',
    credentials: true,
};
exports.logging = {
    level: process.env.LOG_LEVEL || 'info',
};
exports.upload = {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
};
exports.default = {
    database: exports.database,
    jwt: exports.jwt,
    server: exports.server,
    security: exports.security,
    cors: exports.cors,
    logging: exports.logging,
    upload: exports.upload,
};
//# sourceMappingURL=index.js.map