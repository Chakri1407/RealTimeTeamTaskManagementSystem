import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config/config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real-Time Team Task Management API',
      version: '1.0.0',
      description: `
        A production-ready task management system built with Node.js, TypeScript, MongoDB, and Socket.IO.
        
        ## Features
        - User Authentication with JWT
        - Role-based Access Control (Admin, Member)
        - Team Management
        - Project Management
        - Task Management with Lifecycle
        - Real-Time Updates via Socket.IO
        - Activity Logging
        
        ## Authentication
        Most endpoints require a Bearer token in the Authorization header:
        \`Authorization: Bearer <your-access-token>\`
      `,
      contact: {
        name: 'SoluLab',
        email: 'support@solulab.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://your-vercel-app.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['admin', 'member'], example: 'member' },
            teams: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50, example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },

        // Team schemas
        Team: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Development Team' },
            description: { type: 'string', example: 'Main development team' },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  role: { type: 'string', enum: ['admin', 'member'] },
                  joinedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            createdBy: { $ref: '#/components/schemas/User' },
            memberCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTeamRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Development Team' },
            description: { type: 'string', maxLength: 500, example: 'Main development team' },
          },
        },
        AddMemberRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            role: { type: 'string', enum: ['admin', 'member'], default: 'member' },
          },
        },

        // Project schemas
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Redesign company website' },
            team: { $ref: '#/components/schemas/Team' },
            createdBy: { $ref: '#/components/schemas/User' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'] },
            duration: { type: 'number', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProjectRequest: {
          type: 'object',
          required: ['name', 'team'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Website Redesign' },
            description: { type: 'string', maxLength: 1000 },
            team: { type: 'string', description: 'Team ID' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'] },
          },
        },

        // Task schemas
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Implement login page' },
            description: { type: 'string', example: 'Create responsive login page with form validation' },
            project: { $ref: '#/components/schemas/Project' },
            assignedTo: { $ref: '#/components/schemas/User' },
            createdBy: { $ref: '#/components/schemas/User' },
            status: { type: 'string', enum: ['To Do', 'In Progress', 'Review', 'Done'] },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            dueDate: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' } },
            attachments: { type: 'array', items: { type: 'string' } },
            isOverdue: { type: 'boolean' },
            daysUntilDue: { type: 'number', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title', 'project'],
          properties: {
            title: { type: 'string', minLength: 3, maxLength: 200, example: 'Implement login page' },
            description: { type: 'string', maxLength: 2000 },
            project: { type: 'string', description: 'Project ID' },
            assignedTo: { type: 'string', description: 'User ID to assign task to' },
            status: { type: 'string', enum: ['To Do', 'In Progress', 'Review', 'Done'], default: 'To Do' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
            dueDate: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          },
        },
        UpdateTaskStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['To Do', 'In Progress', 'Review', 'Done'] },
          },
        },
        AssignTaskRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', description: 'User ID to assign task to' },
          },
        },

        // Activity Log schemas
        ActivityLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            action: { type: 'string', example: 'task_created' },
            user: { $ref: '#/components/schemas/User' },
            team: { $ref: '#/components/schemas/Team' },
            project: { $ref: '#/components/schemas/Project' },
            task: { $ref: '#/components/schemas/Task' },
            description: { type: 'string' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Health check endpoint' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Teams', description: 'Team management endpoints' },
      { name: 'Projects', description: 'Project management endpoints' },
      { name: 'Tasks', description: 'Task management endpoints' },
      { name: 'Activity', description: 'Activity log endpoints' },
    ],
  },
  apis: ['./src/docs/paths/*.ts', './src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

