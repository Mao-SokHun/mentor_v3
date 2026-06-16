import bcrypt from "bcryptjs";
import User from "../../../models/userModel.js";
import OTP from "../../../models/otpModel.js";
import { validatePassword } from "../validators/authValidation.js";

export const setNewPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase, number, special character and be at least 8 characters",
      });
    }
    // 1. find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. update password
    user.password = hashedPassword;

    await user.save();

    // 4. delete otp
    await OTP.destroy({
      where: {
        user_id: user.user_id,
      },
    });

    res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
