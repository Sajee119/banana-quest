const mongoose = require('mongoose');
const logger = require('../utils/logger');
const env = require('../config/env');
const { BananaApiError } = require('../services/banana.service');

function notFound(req, res, _next) {
    logger.debug(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json(
        { 
            success: false, 
            message: `Route not found: ${req.method} ${req.originalUrl}`
        }
    );
}

function errorHandler(err, req, res, _next) {
    let status = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Map known error types
    if (err instanceof BananaApiError) {
        status = 502;
        message = 'Game service temporarily unavailable. Please try again.';
    } else if (err instanceof mongoose.Error.ValidationError) {
        status = 400;
        message = 'Validation failed: ' + Object.values(err.errors).map((e) => e.message).join(', ');
    } else if (err instanceof mongoose.Error.CastError) {
        status = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.code === 11000) {
        status = 409;
        message = `Duplicate value for field: ${Object.keys(err.keyValue || {}).join(', ')}`;
    }

    const body = { success: false, message };
    if (env.NODE_ENV !== 'production' && err.stack) body.stack = err.stack;

    if (status >= 500) {
        logger.error(err.stack || err.message);
    } else {
        logger.warn(`${status} ${message}`);
    }

    res.status(status).json(body);
}

module.exports = {
    notFound,
    errorHandler,
};