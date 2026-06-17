import User from "../../models/userModel.js";
import { validatePassword } from "./validators/authValidation.js";
import bcrypt from "bcryptjs";

export const deleteUser = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase, number, special character and be at least 8 characters",
      });
    }
    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify that the provided password matches the stored password hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};