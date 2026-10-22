const logger = require('../utils/logger');
const env = require('../config/env');

function notFound(req, res, _next) {
    res.status(404).json(
        { 
            success: false, 
            message: `Route ${req.originalUrl} not found` 
        }
    );
}

function errorHandler(err, req, res, _next) {
    logger.error(err.stack || err.message);

    const statusCode = err.status || err.statusCode || 500;
    const body = {
        success: false,
        message: err.message || 'Internal Server Error',
    };
    if (env.NODE_ENV !== 'production' && err.stack) body.stack = err.stack;

    res.status(statusCode).json(body);
}

module.exports = {
    notFound,
    errorHandler,
};