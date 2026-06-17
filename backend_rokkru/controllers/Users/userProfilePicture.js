import Mentor from "../../models/mentorModel.js";
import Student from "../../models/studentModel.js";
import cloudinary from "../../config/cloudinary.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

export const updateProfilePicture = async (req, res) => {
  try {
    const { user_id } = req.user;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const profile =
      (await Mentor.findByPk(user_id)) ||
      (await Student.findByPk(user_id));

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.profile_public_id) {
      await cloudinary.uploader.destroy(profile.profile_public_id);
    }

    const { secure_url, public_id } = await uploadToCloudinary(req.file.buffer);

    await profile.update({
      profile_picture: secure_url,
      profile_public_id: public_id,
    });

    return res.json({
      success: true,
      message: "Profile picture updated",
      data: { profile_picture: secure_url },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};