const joi = require('joi');
require('dotenv').config();

const schema = joi.object({
    NODE_ENV: joi.string().valid('production', 'development', 'test').default('development'),
    PORT: joi.number().default(3000),
    MONGODB_URI: joi.string().required(),
    SESSION_SECRET: joi.string().min(32).required(),
    GOOGLE_CLIENT_ID: joi.string().required(),
    GOOGLE_CLIENT_SECRET: joi.string().required(),
    FACEBOOK_APP_ID: joi.string().required(),
    FACEBOOK_APP_SECRET: joi.string().required(),
    CLIENT_URL: joi.string().uri().default('http://localhost:3000'),
    COOKIE_SECURE: joi.boolean().default(false),
}).unknown();

const { error, value: envVars } = schema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = env;