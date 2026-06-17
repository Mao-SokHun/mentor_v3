import Mentor from "../../models/mentorModel.js";
import Student from "../../models/studentModel.js";
import User from "../../models/userModel.js";
import UserType from "../../models/userTypeModel.js";
import Province from "../../models/provinceModel.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserType,
          attributes: ["user_type_name"],
        },
        {
          model: Student,
          include: [{ model: Province, attributes: ["province_name", "province_name_kh"] }]
        },
        {
          model: Mentor,
          include: [{ model: Province, attributes: ["province_name", "province_name_kh"] }]
        },
      ],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = user.Student || user.Mentor;

    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.UserType?.user_type_name,

        firstname: profile?.firstname,
        lastname: profile?.lastname,
        phone_number: profile?.phone_number,
        province_id: profile?.province_id,
        address: profile?.Province?.province_name, // fallback for legacy clients
        province: profile?.Province,
        description: profile?.description,
        profile_picture: profile?.profile_picture,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};
