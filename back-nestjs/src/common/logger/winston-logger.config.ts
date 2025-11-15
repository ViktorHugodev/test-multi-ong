import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Custom format for development (pretty print)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    let log = `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}`;

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  }),
);

// Production format (JSON structured)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const winstonLoggerConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isDevelopment ? devFormat : prodFormat,
    }),

    // File transport for errors (production)
    ...(isDevelopment
      ? []
      : [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: prodFormat,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: prodFormat,
          }),
        ]),
  ],
});
