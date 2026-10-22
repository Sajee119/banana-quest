const winston = require('winston');
const env = require('../config/env');

const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) =>
            stack
            ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
            : `[${timestamp}] ${level.toUpperCase()}: ${message}`
        )
    ),
    transports: [
        new winston.transports.Console(),
        ...(env.NODE_ENV === 'production'
            ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' })]
            : []
        ),
    ]
});

module.exports = logger;