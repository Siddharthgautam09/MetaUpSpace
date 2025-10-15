"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = __importDefault(require("../config"));
const database_1 = __importDefault(require("./models/database"));
const logger_1 = __importStar(require("./utils/logger"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const analytics_1 = __importDefault(require("./routes/analytics"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeSwagger();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
            crossOriginEmbedderPolicy: false,
        }));
        this.app.use((0, cors_1.default)({
            origin: '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((0, morgan_1.default)('combined', { stream: logger_1.morganStream }));
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'API is healthy',
                timestamp: new Date().toISOString(),
                environment: config_1.default.server.nodeEnv,
                database: database_1.default.isConnectionReady() ? 'connected' : 'disconnected',
            });
        });
        this.app.get('/', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Enterprise Task Management API',
                version: config_1.default.server.apiVersion,
                status: 'running',
                endpoints: {
                    health: '/health',
                    apiInfo: '/api',
                    auth: '/api/auth',
                    projects: '/api/projects',
                    tasks: '/api/tasks',
                    analytics: '/api/analytics',
                    docs: '/api/docs',
                },
                documentation: '/api/docs',
            });
        });
        this.app.get('/api', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Enterprise Task Management API',
                version: config_1.default.server.apiVersion,
                endpoints: {
                    auth: '/api/auth',
                    projects: '/api/projects',
                    tasks: '/api/tasks',
                    analytics: '/api/analytics',
                    docs: '/api/docs',
                },
            });
        });
    }
    initializeRoutes() {
        const apiPrefix = config_1.default.server.apiPrefix;
        this.app.use(`${apiPrefix}/auth`, auth_1.default);
        this.app.use(`${apiPrefix}/projects`, projects_1.default);
        this.app.use(`${apiPrefix}/tasks`, tasks_1.default);
        this.app.use(`${apiPrefix}/analytics`, analytics_1.default);
        const usersRoutes = require('./routes/users').default;
        this.app.use(`${apiPrefix}/users`, usersRoutes);
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl,
            });
        });
    }
    initializeSwagger() {
        const options = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Enterprise Task Management API',
                    version: '1.0.0',
                    description: 'A comprehensive task management system for enterprises',
                    contact: {
                        name: 'API Support',
                        email: 'support@taskmanagement.com',
                    },
                },
                servers: [
                    {
                        url: `http://localhost:${config_1.default.server.port}${config_1.default.server.apiPrefix}`,
                        description: 'Development server',
                    },
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        },
                    },
                },
                security: [
                    {
                        bearerAuth: [],
                    },
                ],
            },
            apis: ['./src/routes/*.ts', './src/models/*.ts'],
        };
        const specs = (0, swagger_jsdoc_1.default)(options);
        this.app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'Task Management API Documentation',
        }));
    }
    initializeErrorHandling() {
        this.app.use((error, req, res, next) => {
            logger_1.default.error('Unhandled error:', {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
                request: {
                    method: req.method,
                    url: req.url,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                },
            });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: config_1.default.server.nodeEnv === 'development' ? error.message : undefined,
            });
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.default.error('Unhandled Rejection at:', {
                promise,
                reason: reason?.message || reason,
                stack: reason?.stack,
            });
        });
        process.on('uncaughtException', (error) => {
            logger_1.default.error('Uncaught Exception:', {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
            });
            console.error('=== UNCAUGHT EXCEPTION DETAILS ===');
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
            console.error('Name:', error.name);
            console.error('===================================');
            process.exit(1);
        });
        process.on('SIGTERM', () => {
            logger_1.default.info('SIGTERM received, shutting down gracefully');
            this.shutdown();
        });
        process.on('SIGINT', () => {
            logger_1.default.info('SIGINT received, shutting down gracefully');
            this.shutdown();
        });
    }
    async start() {
        try {
            await database_1.default.connect();
            const port = config_1.default.server.port;
            this.app.listen(port, () => {
                logger_1.default.info(`Server running on port ${port} in ${config_1.default.server.nodeEnv} mode`);
                logger_1.default.info(`API documentation available at http://localhost:${port}/api/docs`);
            });
        }
        catch (error) {
            logger_1.default.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async shutdown() {
        try {
            logger_1.default.info('Closing database connection...');
            await database_1.default.disconnect();
            logger_1.default.info('Server shutdown complete');
            process.exit(0);
        }
        catch (error) {
            logger_1.default.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}
const appInstance = new App();
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    appInstance.start();
}
exports.default = appInstance.app;
//# sourceMappingURL=app.js.map