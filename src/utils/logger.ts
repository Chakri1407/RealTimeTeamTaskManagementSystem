import config from '../config/config';

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = config.env === 'development';
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (meta) {
      console.log(logMessage, meta);
    } else {
      console.log(logMessage);
    }
  }

  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  /**
   * Log HTTP requests
   */
  http(method: string, url: string, statusCode: number, responseTime: number): void {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    this.info(message);
  }
}

export default new Logger(); 