import winston from 'winston';
import { ILogger } from '../types';

class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  child(defaultMeta: any): ILogger {
    return new WinstonLogger(this.logger.child(defaultMeta));
  }
}

export function createLogger(service: string): ILogger {
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.metadata({ 
        fillExcept: ['message', 'level', 'timestamp', 'service'] 
      }),
      winston.format.json()
    ),
    defaultMeta: { service },
    transports: [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            const metaStr = Object.keys(meta).length ? 
              `\n${JSON.stringify(meta, null, 2)}` : '';
            return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
          })
        )
      }),
      
      // File transport for production
      new winston.transports.File({
        filename: 'logs/scraper-error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      
      new winston.transports.File({
        filename: 'logs/scraper-combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ],
    
    // Handle uncaught exceptions
    exceptionHandlers: [
      new winston.transports.File({ filename: 'logs/scraper-exceptions.log' })
    ],
    
    // Handle unhandled promise rejections
    rejectionHandlers: [
      new winston.transports.File({ filename: 'logs/scraper-rejections.log' })
    ]
  });

  return new WinstonLogger(logger);
}

export default createLogger; 