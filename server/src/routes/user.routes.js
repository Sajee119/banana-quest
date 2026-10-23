const router = require('express').Router();
const { ensureAuthenticated } = require('../middlewares/auth.middleware');
const gameService = require('../services/game.service');

router.get('/me', ensureAuthenticated, (req, res, next) => {
    try {
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
            stats: {
                totalPoints: stats.totalPoints || 0,
                gamesPlayed: stats.gamesPlayed || 0,
                gamesWon: stats.gamesWon || 0,
                currentStreak: stats.currentStreak || 0,
                bestStreak: stats.bestStreak || 0,
                fastestAnswerMs: stats.fastestAnswerMs || null,
            },
        });
    } catch (err) {
        next(err);
    }
    
});

router.get('/leaderboard', async (req, res, next) => {
    try {
        const Score = require('../models/Score');
        const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
        const top = await Score.find()
            .sort({ totalPoints: -1 })
            .limit(limit)
            .populate('user', 'firstName lastName email avatar');

        res.json({
            success: true,
            data: top.map((s, idx) => ({
                rank: idx + 1,
                displayName: s.user ? s.user.displayName : 'Unknown',
                avatar: s.user ? s.user.avatar : null,
                totalPoints: s.totalPoints,
                gamesWon: s.gamesWon,
                bestStreak: s.bestStreak,
            })),
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;