import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from '../config';
import database from './models/database';
import logger, { morganStream } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import analyticsRoutes from './routes/analytics';

/**
 * Express application class
 */
class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middlewares
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
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

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.security.rateLimitWindowMs,
      max: config.security.rateLimitMaxRequests,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined', { stream: morganStream }));

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
        database: database.isConnectionReady() ? 'connected' : 'disconnected',
      });
    });

    // API info endpoint
    this.app.get('/api', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Enterprise Task Management API',
        version: config.server.apiVersion,
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

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    const apiPrefix = config.server.apiPrefix;

    // Mount routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/projects`, projectRoutes);
    this.app.use(`${apiPrefix}/tasks`, taskRoutes);
    this.app.use(`${apiPrefix}/analytics`, analyticsRoutes);

    // 404 handler for undefined routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
      });
    });
  }

  /**
   * Initialize Swagger documentation
   */
  private initializeSwagger(): void {
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
            url: `http://localhost:${config.server.port}${config.server.apiPrefix}`,
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
      apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API files
    };

    const specs = swaggerJsdoc(options);
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Task Management API Documentation',
    }));
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error:', {
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
        error: config.server.nodeEnv === 'development' ? error.message : undefined,
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', {
        promise,
        reason: reason?.message || reason,
        stack: reason?.stack,
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      });

      // Log to console as well for debugging
      console.error('=== UNCAUGHT EXCEPTION DETAILS ===');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Name:', error.name);
      console.error('===================================');

      // Graceful shutdown
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      const port = config.server.port;
      this.app.listen(port, () => {
        logger.info(`Server running on port ${port} in ${config.server.nodeEnv} mode`);
        logger.info(`API documentation available at http://localhost:${port}/api/docs`);
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    try {
      logger.info('Closing database connection...');
      await database.disconnect();
      logger.info('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new App();

// Start server only if this file is run directly
if (require.main === module) {
  app.start();
}

export default app.app;