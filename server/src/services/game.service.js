// src/services/game.service.js
const GameSession = require('../models/GameSession');
const Score = require('../models/Score');
const { fetchPuzzle } = require('./banana.service');
const { getMode, DEFAULT_MODE } = require('../config/gameModes');

const env = require('../config/env');
const BASE_POINTS = env.GAME_BASE_POINTS;
const FAST_BONUS_MAX = env.GAME_FAST_BONUS_MAX;
const FAST_THRESHOLD_MS = env.GAME_FAST_THRESHOLD_MS;
const STREAK_MULTIPLIER_STEP = 0.1;
const MAX_STREAK_MULTIPLIER = env.GAME_MAX_STREAK_MULTIPLIER;

/**
 * Start a new game: fetch puzzle, hide solution, return only image.
 */
async function startSession(userId, modeId = DEFAULT_MODE) {
  const mode = getMode(modeId);
  const { imageUrl, solution } = await fetchPuzzle();
  const timeLimitMs = mode.timeLimitMs;
  const expiresAt = new Date(Date.now() + timeLimitMs);

  const session = await GameSession.create({
    user: userId,
    mode: mode.id,
    imageUrl,
    solution,
    expiresAt,
  });

  return {
    sessionId: session._id,
    imageUrl: session.imageUrl,
    expiresAt: session.expiresAt,
    timeLimitMs,
    mode: {
      id: mode.id,
      label: mode.label,
      tagline: mode.tagline,
      pointsMultiplier: mode.pointsMultiplier,
      speedBonus: mode.speedBonus,
    },
  };
}

/**
 * Submit an answer and score it.
 */
async function submitAnswer(userId, sessionId, answer) {
    // .select('+solution') — solution is hidden by schema default
    const session = await GameSession.findOne({
        _id: sessionId,
        user: userId,
    }).select('+solution');

    if (!session) {
        return { error: 'SESSION_NOT_FOUND', status: 404 };
    }
    if (session.status !== 'active') {
        return { error: 'SESSION_ALREADY_ANSWERED', status: 409 };
    }
    if (session.expiresAt < new Date()) {
        session.status = 'expired';
        await session.save();
        return { error: 'SESSION_EXPIRED', status: 410 };
    }

    const isCorrect = Number(answer) === session.solution;
    const answerMs = Date.now() - session.createdAt.getTime();
    const mode = getMode(session.mode);

    // ---- Scoring ----
    let points = 0;
    if (isCorrect) {
        const speedBonus = mode.speedBonus
            ? Math.max(
                0,
                Math.round(FAST_BONUS_MAX * (1 - Math.min(answerMs, FAST_THRESHOLD_MS) / FAST_THRESHOLD_MS))
            )
            : 0;

        const scoreDoc = await Score.findOne({ user: userId });
        const streak = scoreDoc ? scoreDoc.currentStreak : 0;
        const streakMultiplier = Math.min(
            MAX_STREAK_MULTIPLIER,
            1 + streak * STREAK_MULTIPLIER_STEP
        );

        points = Math.round((BASE_POINTS + speedBonus) * streakMultiplier * mode.pointsMultiplier);
    }

    session.status = 'answered';
    session.playerAnswer = Number(answer);
    session.isCorrect = isCorrect;
    session.pointsAwarded = points;
    session.timeToAnswerMs = answerMs;
    await session.save();

    const score = await Score.recordResult(userId, {
        isCorrect,
        points,
        answerMs,
        mode: mode.id,
    });

    return {
        isCorrect,
        pointsAwarded: points,
        answerMs,
        solution: session.solution, // reveal only AFTER answering
        playerAnswer: session.playerAnswer,
        mode: mode.id,
        stats: {
        totalPoints: score.totalPoints,
        gamesPlayed: score.gamesPlayed,
        gamesWon: score.gamesWon,
        currentStreak: score.currentStreak,
        bestStreak: score.bestStreak,
        fastestAnswerMs: score.fastestAnswerMs,
        },
    };
}

/**
 * Get a user's scoreboard entry.
 */
async function getUserStats(userId) {
    const score = await Score.findOne({ user: userId });
    if (!score) {
        return {
            totalPoints: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0,
            fastestAnswerMs: null,
        };
    }
    return score;
}

module.exports = { startSession, submitAnswer, getUserStats };