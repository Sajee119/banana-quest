const router = require('express').Router();
const Joi = require('joi');
const { ensureAuthenticated } = require('../middleware/auth.middleware');
const gameService = require('../services/game.service');
const asyncHandler = require('../utils/asyncHandler');

// All game routes require auth
router.use(ensureAuthenticated);

const answerSchema = Joi.object({
    sessionId: Joi.string().hex().length(24).required(),
    answer: Joi.number().integer().min(0).max(1000).required(),
});

router.post('/start', asyncHandler(async (req, res) => {
    const session = await gameService.startSession(req.user.id);
    res.status(201).json({ success: true, data: session });
}));

router.post('/answer', asyncHandler(async (req, res) => {
    const { value, error } = answerSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const result = await gameService.submitAnswer(req.user.id, value.sessionId, value.answer);
    if (result.error) return res.status(result.status).json({ success: false, message: result.error });

    res.json({ success: true, data: result });
}));

router.get('/stats', asyncHandler(async (req, res) => {
    const stats = await gameService.getUserStats(req.user.id);
    res.json({ success: true, data: stats });
}));

module.exports = router;