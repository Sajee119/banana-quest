const router = require('express').Router();
const passport = require('passport');
const env = require('../config/env');
const { ensureGuest } = require('../middleware/auth.middleware');

const authOptions = {
    failureRedirect: `${env.CLIENT_URL}/login-failed`,
    failureMessage: true,
};

// google auth
router.get(
    '/google',
    ensureGuest,
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

router.get(
    '/google/callback',
    passport.authenticate('google', authOptions),
    (req, res) => res.redirect(`${env.CLIENT_URL}/profile`)
);

// facebook auth
router.get(
    '/facebook',
    ensureGuest,
    passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', authOptions),
    (req, res) => res.redirect(`${env.CLIENT_URL}/profile`)
);

// logout
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((err2) => {
        if (err2) return next(err2);
            res.clearCookie('sid');
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