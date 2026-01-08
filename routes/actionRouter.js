const express = require("express");
const router = express.Router();
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

const UserState = mongoose.models.UserState || mongoose.model('UserState', userStateSchema);

const sessionMiddleware = require("../middleware/session");

// helper
const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// DONE ACTION
router.post("/done", sessionMiddleware, async (req, res) => {
  try {
    const userState = req.userState;
    const today = new Date();

    // no brief served today
    if (
      !userState.lastActionDate ||
      !isSameDay(new Date(userState.lastActionDate), today)
    ) {
      return res.status(400).json({ error: "No brief to complete today" });
    }

    // already done today
    if (userState.lastActionType === "done") {
      return res.json({ status: "already_done", streak: userState.streak });
    }

    // Allow completion after skipping - user can skip then complete
    userState.streak += 1;
    userState.lastActionType = "done";
    userState.lastActionDate = today;

    await userState.save();

    res.json({ status: "ok", streak: userState.streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// SKIP ACTION
router.post("/skip", sessionMiddleware, async (req, res) => {
  try {
    const userState = req.userState;
    const today = new Date();

    // no brief served today
    if (
      !userState.lastActionDate ||
      !isSameDay(new Date(userState.lastActionDate), today)
    ) {
      return res.status(400).json({ error: "No brief to skip today" });
    }

    // prevent skip after done (but allow multiple skips)
    if (userState.lastActionType === "done") {
      return res.status(400).json({ error: "Cannot skip after completing task" });
    }

    // Allow multiple skips - don't check if already skipped
    userState.lastActionType = "skip";
    userState.lastActionDate = today;

    await userState.save();

    res.json({ status: "ok", streak: userState.streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
