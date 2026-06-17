import User from "../../../models/userModel.js";
import OTP from "../../../models/otpModel.js";
import jwt from "jsonwebtoken";

export const verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }


    const user = await User.findOne({
      where: { email },
    });

    // check user
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // find otp
    const validOTP = await OTP.findOne({
      where: {
        code: otp,
        user_id: user.user_id,
      },
    });

    if (!validOTP) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // expired date
    if (validOTP.expires_at < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // Destroy the OTP after successful verification
    await OTP.destroy({ where: { user_id: user.user_id } });

    // Issue a short-lived password reset token as proof of OTP verification
    const resetToken = jwt.sign(
      { user_id: user.user_id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
        message: error.message,
    })
  }
};
