const mongoose = require('mongoose');

/**
 * One record per successful sign-in. Used by the account page to show the
 * player's recent login history and the devices they have used.
 */
const loginEventSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        method: {
            type: String,
            enum: ['password', 'google', 'facebook', 'register'],
            required: true,
        },
        ip: { type: String, default: '' },
        userAgent: { type: String, default: '' },
        browser: { type: String, default: 'Unknown browser' },
        os: { type: String, default: 'Unknown OS' },
        deviceType: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown',
        },
        // SHA-256 of the express-session id, so we can highlight the device
        // that is making the current request without storing the raw cookie.
        sessionKey: { type: String, default: '', index: true },
    },
    { timestamps: true }
);

loginEventSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('LoginEvent', loginEventSchema);
