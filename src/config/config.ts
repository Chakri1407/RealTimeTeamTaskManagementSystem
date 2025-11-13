import dotenv from 'dotenv';

dotenv.config();

interface Config {
  env: string;
  port: number;
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  socket: {
    corsOrigin: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodb: {
    uri: process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/task-management-test'
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
  },
};

export default config; 