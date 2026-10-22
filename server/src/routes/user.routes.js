const router = require('express').Router();
const { ensureAuthenticated } = require('../middlewares/auth.middleware');

router.get('/me', ensureAuthenticated, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            displayName: req.user.displayName,
            primaryProvider: req.user.primaryProvider,
            providerNames: req.user.providerNames,
            avatar: req.user.avatar,
            createdAt: req.user.createdAt,
            lastLoginAt: req.user.lastLoginAt,
        },
    });
});

module.exports = router;