const router = require('express').Router();
const Joi = require('joi');
const { ensureAuthenticated } = require('../middleware/auth.middleware');
const gameService = require('../services/game.service');

// All game routes require auth
router.use(ensureAuthenticated);

const answerSchema = Joi.object({
    sessionId: Joi.string().hex().length(24).required(),
    answer: Joi.number().integer().min(0).max(1000).required(),
});

/**
 * POST /api/game/start
 * Returns a fresh puzzle (image only, solution hidden).
 */
router.post('/start', async (req, res, next) => {
    try {
        const session = await gameService.startSession(req.user.id);
        res.status(201).json({ success: true, data: session });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/game/answer
 * Body: { sessionId, answer }
 */
router.post('/answer', async (req, res, next) => {
    try {
        const { value, error } = answerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const result = await gameService.submitAnswer(req.user.id, value.sessionId, value.answer);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/game/stats
 * Personal scoreboard.
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await gameService.getUserStats(req.user.id);
        res.json({ success: true, data: stats });
    } catch (err) {
        next(err);
    }
});

module.exports = router;