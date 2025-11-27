import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import config from './config/config';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import swaggerSpec from './docs/swagger';

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app: Application = express();

  // ============================================================================
  // Security Middleware
  // ============================================================================
  
  // Helmet - Set security-related HTTP headers
  app.use(helmet());

  // CORS - Enable Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ============================================================================
  // Request Processing Middleware
  // ============================================================================

  // Body parser - Parse JSON request bodies
  app.use(express.json({ limit: '10mb' }));

  // URL-encoded parser - Parse URL-encoded request bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression - Compress response bodies
  app.use(compression());

  // ============================================================================
  // Logging Middleware
  // ============================================================================

  // Morgan - HTTP request logger
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    // Custom morgan format for production
    app.use(
      morgan('combined', {
        skip: (req: Request) => req.url === '/api/health',
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      })
    );
  }

  // ============================================================================
  // API Documentation
  // ============================================================================

  // Swagger UI - API Documentation
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Task Management API Docs',
    })
  );

  // Swagger JSON endpoint
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ============================================================================
  // API Routes
  // ============================================================================

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Real-Time Team Task Management API',
      version: '1.0.0',
      environment: config.env,
      documentation: '/api-docs',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        teams: '/api/teams',
        projects: '/api/projects',
        tasks: '/api/tasks',
        activity: '/api/activity',
      },
    });
  });

  // Mount API routes
  app.use('/api', routes);

  // ============================================================================
  // Error Handling
  // ============================================================================

  // 404 handler - Must be after all other routes
  app.use('*', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // Global error handler - Must be last
  app.use(errorHandler);

  return app;
};

export default createApp; 