const express = require("express");
const router = express.Router();

const sessionMiddleware = require("../middleware/session");

// helper: check if two dates are same day
const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// DONE
router.post("/done", sessionMiddleware, async (req, res) => {
  try {
    const userState = req.userState;
    const today = new Date();

    // no brief served today
    if (
      !userState.lastBriefDate ||
      !isSameDay(new Date(userState.lastBriefDate), today)
    ) {
      return res.status(400).json({ error: "No brief to act on today" });
    }

    // already done
    if (userState.lastActionType === "done") {
      return res.json({
        status: "already_done",
        streak: userState.streak,
      });
    }

    userState.streak += 1;
    userState.lastActionType = "done";
    userState.lastActionDate = today;

    await userState.save();

    res.json({
      status: "ok",
      streak: userState.streak,
    });
  } catch (err) {
    console.error("DONE ROUTE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// SKIP
router.post("/skip", sessionMiddleware, async (req, res) => {
  try {
    const userState = req.userState;
    const today = new Date();

    // no brief served today
    if (
      !userState.lastBriefDate ||
      !isSameDay(new Date(userState.lastBriefDate), today)
    ) {
      return res.status(400).json({ error: "No brief to act on today" });
    }

    // prevent skip after done
    if (userState.lastActionType === "done") {
      return res
        .status(400)
        .json({ error: "Cannot skip after completing task" });
    }

    userState.lastActionType = "skip";
    userState.lastActionDate = today;

    await userState.save();

    res.json({
      status: "ok",
      streak: userState.streak,
    });
  } catch (err) {
    console.error("SKIP ROUTE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
