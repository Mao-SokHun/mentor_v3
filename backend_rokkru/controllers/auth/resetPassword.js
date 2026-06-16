import bcrypt from "bcryptjs";
import User from "../../models/userModel.js";

export const resetPassword = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { oldPassword, newPassword } = req.body;

        // find user again
        const user = await User.findByPk(userId);
        
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        const isMathPass = await bcrypt.compare(oldPassword, user.password);

        if (!isMathPass){
            return res.status(400).json({
                message: "Old password is incorrect.",
            })
        }

        // Check if new password is the same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword){
            return res.status(400).json({
                message: "New password cannot be the same as old password",
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword,10)

        user.password = hashedPassword;
        await user.save();

        res.json({
            message: "Password updated successfully.",
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};