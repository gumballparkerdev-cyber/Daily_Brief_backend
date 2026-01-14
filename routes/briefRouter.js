const express = require("express");
const router = express.Router();

const Brief = require("../models/brief");
const UserState = require("../models/UserState");
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
  if (lastDifficulty === "hard") return "normal";

  return Math.random() < 0.2 ? "hard" : "normal";
};

router.get("/", sessionMiddleware, async (req, res) => {
  try {
    const userState = req.userState;
    const today = new Date();

    // 1. Lock brief ONLY if user already completed today
    if (
      userState.lastBriefId &&
      userState.lastActionDate &&
      isSameDay(new Date(userState.lastActionDate), today) &&
      userState.lastActionType === "done"
    ) {
      const existingBrief = await Brief.findById(userState.lastBriefId);

      return res.json({
        brief: existingBrief,
        userState: {
          streak: userState.streak,
          lastActionType: userState.lastActionType,
          actionCompleted: true,
        },
      });
    }

    // 2. Decide difficulty
    const difficulty = getDifficulty(userState);

    // 3. Find briefs (exclude last one)
    const excludeIds = userState.lastBriefId ? [userState.lastBriefId] : [];

    let briefs = await Brief.find({
      difficulty,
      active: true,
      _id: { $nin: excludeIds },
    });

    // 4. Fallback to easy
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

    // 5. Pick random brief
    const brief = briefs[Math.floor(Math.random() * briefs.length)];

    // 6. Save state for NEW brief
    userState.lastBriefId = brief._id;
    userState.lastActionDate = today;   // brief exists today
    userState.lastActionType = null;    // 🔑 reset action
    userState.lastDifficulty = difficulty;

    await userState.save();

    res.json({
      brief: {
        id: brief._id,
        text: brief.text,
        difficulty,
      },
      userState: {
        streak: userState.streak,
        lastActionType: null,
        actionCompleted: false,
      },
    });
  } catch (err) {
    console.error("BRIEF ROUTE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
