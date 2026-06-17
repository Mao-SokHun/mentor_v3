import User from "../../models/userModel.js";
import UserType from "../../models/userTypeModel.js";
import Mentor from "../../models/mentorModel.js";
import Student from "../../models/studentModel.js";

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const {
            firstname,
            lastname,
            phone_number,
            province_id,
            description
        } = req.body;

        if (!firstname?.trim() || !lastname?.trim() || !phone_number || !province_id) {
            return res.status(400).json({
                success: false,
                message: "Please provide required fields (firstname, lastname, phone_number, province_id)."
            });
        }

        const user = await User.findByPk(userId, {
            include: [
                {
                    model: UserType,
                    attributes: ["user_type_name"]
                },
            ]
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }
        const role = user.UserType?.user_type_name?.toLowerCase();

        if (role === "student") {
            const student = await Student.findByPk(userId);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found",
                })
            }

            await student.update({
                firstname,
                lastname,
                phone_number,
                province_id,
                description,
            })
        }
        else if (role === "teacher") {
            const mentor = await Mentor.findByPk(userId)

            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher profile not found",
                })
            }

            await mentor.update({
                firstname,
                lastname,
                phone_number,
                province_id,
                description
            })
        }

        else {
            return res.status(403).json({
                success: false,
                message: "Invalid role"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Profile updates successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "False to update profile"
        })
    }
}