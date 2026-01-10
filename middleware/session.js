const { v4: uuidv4 } = require("uuid");
const mongoose = require('mongoose');

// Inline UserState model to avoid import issues
const userStateSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    streak: {
        type: Number,
        default: 0,
    },
    lastBriefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brief', 
    },
    lastBriefDate: {
        type: Date,
    },
    lastDifficulty: {
        type: String,
        enum: ['easy', 'normal', 'hard'],
    },
    lastActionDate: {
        type: Date,
    },
    lastActionType: {
        type: String,
        enum: ['done', 'skip'],
    },
});

const UserState = mongoose.models.userState || mongoose.model('UserState', userStateSchema);

module.exports = async (req, res, next) => {
  try {
    let sessionId = req.cookies.sessionId;

    // 1. If no sessionId, create one
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        sameSite: "strict",
      });
    }

    // 2. Find or create user state
    let userState = await UserState.findOne({ sessionId });

    if (!userState) {
      userState = await UserState.create({
        sessionId,
        streak: 0,
      });
    }

    req.userState = userState;
    next();
  } catch (err) {
    next(err);
  }
};
