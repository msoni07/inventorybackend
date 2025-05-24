const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  let log = `${timestamp} ${level}: ${message}`;
  if (stack) {
    log = `${log}\n${stack}`;
  }
  return log;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default to 'info'
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info', // Log info and above to file
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Keep up to 5 log files
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error', // Log only errors to this file
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
  ]
});

// If not in production, also log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      align(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    level: 'debug', // Log debug and above to console in non-production
  }));
}

module.exports = logger;
