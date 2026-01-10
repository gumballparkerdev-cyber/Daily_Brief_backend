const express = require("express");
const router = express.Router();

const Brief = require("../models/Brief");
const UserState = require("../models/userState");
const sessionMiddleware = require("../middleware/session");

// helper: check if two dates are same day
const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// helper: decide difficulty
const getDifficulty = (userState) => {
  const { streak, lastDifficulty } = userState;

  if (streak < 7) return "easy";

  if (streak < 30) {
    return Math.random() < 0.7 ? "normal" : "easy";
  }

  // streak 30+
  if (lastDifficulty === "hard") {
    return "normal";
  }

  return Math.random() < 0.2 ? "hard" : "normal";
};

router.get("/", sessionMiddleware, async (req, res) => {
  try {
    const userState = req.userState;
    const today = new Date();

// 1. Lock brief only if user DONE today
if (
  userState.lastActionDate &&
  isSameDay(new Date(userState.lastActionDate), today) &&
  userState.lastActionType === 'done'
) {
  const existingBrief = await Brief.findById(userState.lastBriefId);
  return res.json({ 
    brief: existingBrief,
    userState: {
      streak: userState.streak,
      lastActionType: userState.lastActionType,
      actionCompleted: true
    }
  });
}

    // 2. Decide difficulty
    const difficulty = getDifficulty(userState);

    // 3. Find random briefs with proper difficulty, excluding recent ones
    const excludeIds = userState.lastBriefId ? [userState.lastBriefId] : [];
    
    let briefs = await Brief.find({
      difficulty,
      active: true,
      _id: { $nin: excludeIds },
    });

    // 4. Fallback if nothing found
    if (briefs.length === 0 && difficulty !== "easy") {
      briefs = await Brief.find({
        difficulty: "easy",
        active: true,
        _id: { $nin: excludeIds },
      });
    }

    if (briefs.length === 0) {
      return res.status(404).json({ error: "No brief available" });
    }

    // 5. Select random brief from available ones
    const randomIndex = Math.floor(Math.random() * briefs.length);
    const brief = briefs[randomIndex];

    // 6. Save state (only update lastBriefId, don't change action state for skips)
    userState.lastBriefId = brief._id;
    userState.lastActionDate = today;
    userState.lastDifficulty = difficulty;
    await userState.save();

    res.json({
      brief: {
        id: brief._id,
        text: brief.text,
        difficulty: difficulty,
      },
      userState: {
        streak: userState.streak,
        lastActionType: userState.lastActionType,
        actionCompleted: userState.lastActionType === 'done'
      }
    });
} catch (err) {
  console.error("BRIEF ROUTE ERROR:", err);
  res.status(500).json({ error: err.message });
}

});

module.exports = router;
