import express from "express";
import { protect } from "../../../middleware/auth/auth.js";
import { getUserProfile } from "../../../controllers/Users/getUserProfile.js";
import { updateUserProfile } from "../../../controllers/Users/updateUserProfile.js";
import upload from "../../../middleware/upload.js"
import { updateProfilePicture } from "../../../controllers/Users/userProfilePicture.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information (Student or Mentor) including province details.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */
router.get('/me', protect, getUserProfile);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     description: Update the authenticated user's profile information. Requires firstname, lastname, phone_number, and province_id.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['firstname', 'lastname', 'phone_number', 'province_id']
 *             properties:
 *               firstname: { type: 'string' }
 *               lastname: { type: 'string' }
 *               phone_number: { type: 'string' }
 *               province_id: { type: 'integer' }
 *               description: { type: 'string' }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error (missing required fields)
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */
router.put('/me', protect, updateUserProfile)

/**
 * @swagger
 * /api/v1/users/me/profile-picture:
 *   put:
 *     summary: Update profile picture
 *     description: Upload a new profile picture to Cloudinary and update the user's profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       400:
 *         description: No image uploaded or file too large
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Upload failed
 */
router.put(
  "/me/profile-picture",
  protect,
  upload.single("profile_picture"),
  updateProfilePicture
);

export default router;