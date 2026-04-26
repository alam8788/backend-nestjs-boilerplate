import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// ======== it is the log format how each log will look like 
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);


// transport basically defines where the log will go 
export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        logFormat,
        winston.format.colorize({ all: true }),
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: logFormat,
    }),
  ],
};
