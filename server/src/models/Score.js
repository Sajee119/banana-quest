const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true, 
            unique: true 
        },
        totalPoints: { type: Number, default: 0 },
        gamesPlayed: { type: Number, default: 0 },
        gamesWon: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        bestStreak: { type: Number, default: 0 },
        fastestAnswerMs: { type: Number, default: null },
        lastPlayedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Add points & update streaks atomically
scoreSchema.statics.recordResult = async function (userId, { isCorrect, points, answerMs }) {
    const score = await this.findOneAndUpdate(
        { user: userId },
        { $setOnInsert: { user: userId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    score.gamesPlayed += 1;
    score.lastPlayedAt = new Date();

    if (isCorrect) {
        score.gamesWon += 1;
        score.totalPoints += points;
        score.currentStreak += 1;
        score.bestStreak = Math.max(score.bestStreak, score.currentStreak);
        if (score.fastestAnswerMs == null || answerMs < score.fastestAnswerMs) {
            score.fastestAnswerMs = answerMs;
        }
    } else {
        score.currentStreak = 0;
    }

    await score.save();
    return score;
};

module.exports = mongoose.model('Score', scoreSchema);