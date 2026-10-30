const router = require('express').Router();
const passport = require('passport');
const env = require('../config/env');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { recordLogin } = require('../services/loginHistory.service');
const { ensureGuest } = require('../middleware/auth.middleware');

const authOptions = {
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
    failureMessage: true,
};

// Where the player lands after a successful sign-in.
const successRedirect = `${env.CLIENT_URL}/dashboard`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
    if (typeof email !== 'string' || !email.trim()) return 'Email is required.';
    const value = email.trim();
    if (value.length > 254 || !EMAIL_PATTERN.test(value)) return 'Enter a valid email address.';
    return null;
}

function validatePassword(password) {
    if (typeof password !== 'string' || !password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password.length > 72) return 'Password must be 72 characters or fewer.';
    return null;
}

function loginUser(req, user) {
    return new Promise((resolve, reject) => {
        req.login(user, (err) => (err ? reject(err) : resolve()));
    });
}

// email + password signup
router.post('/register', asyncHandler(async (req, res) => {
    const { name = '', email = '', password = '' } = req.body || {};
    const displayName = typeof name === 'string' ? name.trim() : '';

    if (displayName.length < 2) {
        return res.status(400).json({ success: false, message: 'Please enter your name (at least 2 characters).' });
    }
    if (displayName.length > 60) {
        return res.status(400).json({ success: false, message: 'Name must be 60 characters or fewer.' });
    }

    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ success: false, message: emailError });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ success: false, message: passwordError });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.exists({ email: normalizedEmail });
    if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists. Try signing in.' });
    }

    const user = await User.registerLocal({ name: displayName, email: normalizedEmail, password });
    await loginUser(req, user);
    await recordLogin(req, user.id, 'register');

    return res.status(201).json({ success: true, user });
}));

// email + password login
router.post('/login', asyncHandler(async (req, res) => {
    const { email = '', password = '' } = req.body || {};

    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ success: false, message: emailError });
    if (typeof password !== 'string' || !password) {
        return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const user = await User.findByEmailWithPassword(email);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.passwordHash) {
        return res.status(409).json({
            success: false,
            message: 'This account uses social sign-in. Continue with Google or Facebook.',
        });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLoginAt = new Date();
    await user.save();
    await loginUser(req, user);
    await recordLogin(req, user.id, 'password');

    return res.json({ success: true, user });
}));

// google auth
router.get(
    '/google',
    ensureGuest,
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

router.get(
    '/google/callback',
    passport.authenticate('google', authOptions),
    asyncHandler(async (req, res) => {
        await recordLogin(req, req.user.id, 'google');
        res.redirect(successRedirect);
    })
);

// facebook auth
router.get(
    '/facebook',
    ensureGuest,
    passport.authenticate('facebook', { scope: ['public_profile'] })
);

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', authOptions),
    asyncHandler(async (req, res) => {
        await recordLogin(req, req.user.id, 'facebook');
        res.redirect(successRedirect);
    })
);

// logout
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((err2) => {
        if (err2) return next(err2);
            res.clearCookie('sid', { path: '/' });
            res.json({ success: true, message: 'Logged out' });
        });
    });
});

// status
router.get('/status', (req, res) => {
    res.json({
        authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        user: req.user || null,
    });
});

module.exports = router;
