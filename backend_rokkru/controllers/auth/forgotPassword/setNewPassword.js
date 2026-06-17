import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../../models/userModel.js";
import { validatePassword } from "../validators/authValidation.js";

export const setNewPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    // Verify the reset token issued by verifyForgotOtp
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired reset token. Please verify OTP again.",
      });
    }

    // Ensure the token was actually issued for a password reset (not a login token)
    if (decoded.purpose !== "password_reset") {
      return res.status(401).json({
        message: "Invalid token purpose.",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase, number, special character and be at least 8 characters",
      });
    }

    // find user by the id embedded in the verified token
    const user = await User.findByPk(decoded.user_id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
