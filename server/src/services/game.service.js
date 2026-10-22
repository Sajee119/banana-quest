// src/services/game.service.js
const GameSession = require('../models/GameSession');
const Score = require('../models/Score');
const { fetchPuzzle } = require('./banana.service');

const SESSION_TTL_MS = 2 * 60 * 1000; // 2 minutes to answer
const BASE_POINTS = 100;
const FAST_BONUS_MAX = 50;            // max speed bonus
const FAST_THRESHOLD_MS = 10_000;     // under 10s → full bonus
const STREAK_MULTIPLIER_STEP = 0.1;   // +10% per streak level
const MAX_STREAK_MULTIPLIER = 2.0;

/**
 * Start a new game: fetch puzzle, hide solution, return only image.
 */
async function startSession(userId) {
  const { imageUrl, solution } = await fetchPuzzle();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await GameSession.create({
    user: userId,
    imageUrl,
    solution,
    expiresAt,
  });

  return {
    sessionId: session._id,
    imageUrl: session.imageUrl,
    expiresAt: session.expiresAt,
    timeLimitMs: SESSION_TTL_MS,
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

    // ---- Scoring ----
    let points = 0;
    if (isCorrect) {
        const speedBonus = Math.max(
            0,
            Math.round(FAST_BONUS_MAX * (1 - Math.min(answerMs, FAST_THRESHOLD_MS) / FAST_THRESHOLD_MS))
        );

        const scoreDoc = await Score.findOne({ user: userId });
        const streak = scoreDoc ? scoreDoc.currentStreak : 0;
        const streakMultiplier = Math.min(
            MAX_STREAK_MULTIPLIER,
            1 + streak * STREAK_MULTIPLIER_STEP
        );

        points = Math.round((BASE_POINTS + speedBonus) * streakMultiplier);
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
    });

    return {
        isCorrect,
        pointsAwarded: points,
        answerMs,
        solution: session.solution, // reveal only AFTER answering
        stats: {
        totalPoints: score.totalPoints,
        gamesPlayed: score.gamesPlayed,
        gamesWon: score.gamesWon,
        currentStreak: score.currentStreak,
        bestStreak: score.bestStreak,
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