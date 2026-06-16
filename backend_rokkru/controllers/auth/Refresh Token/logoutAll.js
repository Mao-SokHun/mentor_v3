import UserSession from "../../../models/userSessionModel.js";

export const logoutAll = async (req, res) => {
    try {
        const userId = req.userId;

        await UserSession.update(
            { is_revoked: true},
            {
                where:{
                    user_id: userId,
                }
            }
        )

        res.clearCookie("refreshToken");

        return res.json({
            message: "Logged out from all devices."
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}