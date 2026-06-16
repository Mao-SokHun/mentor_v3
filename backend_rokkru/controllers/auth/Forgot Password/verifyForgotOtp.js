import User from "../../../models/userModel.js";
import OTP from "../../../models/otpModel.js";

export const verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // finduser

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
    if (validOTP.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    return res.json({
        message: "OTP verified successfully",
    })
  } catch (error) {
    res.status(500).json({
        message: error.message,
    })
  }
};
