const { v4: uuidv4 } = require("uuid");
const UserState = require("../models/userState");

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
