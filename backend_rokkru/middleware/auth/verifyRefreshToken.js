import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserSession from "../../models/userSessionModel.js";

export const verifyRefreshToken = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const sessions = await UserSession.findAll({
      where: {
        user_id: decoded.user_id,
        is_revoked: false,
      },
    });

    let validSession = null;

    for (const session of sessions) {
      const match = await bcrypt.compare(
        refreshToken,
        session.refresh_token_hash
      );

      if (match) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    if (validSession.expires_at < new Date()) {
      return res.status(401).json({
        message: "Session expired",
      });
    }

    req.userId = decoded.user_id;
    req.session = validSession;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};