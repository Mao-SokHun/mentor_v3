import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as mentorController from '../../../controllers/mentorSystem/mentorController.js';
import * as analyticsController from '../../../controllers/mentorSystem/mentorAnalyticsController.js';
import * as postsController from '../../../controllers/mentorSystem/mentorPostsController.js';
import * as bundleController from '../../../controllers/mentorSystem/mentorBundleController.js';
import { profilePictureUpload } from '../../../middleware/mentorSystem/profilePictureUpload.js';

const router = Router();

/**
 * @swagger
 * /api/v1/mentors/me:
 *   get:
 *     summary: Get my mentor profile
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Mentor' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mentor profile not found
 */
router.get('/mentors/me', ...mentorAuth, mentorController.getMyMentor);

/**
 * @swagger
 * /api/v1/mentors/me/analytics:
 *   get:
 *     summary: Get my mentor analytics
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics payload
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MentorApiSuccess' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mentor profile not found
 */
router.get('/mentors/me/analytics', ...mentorAuth, analyticsController.getMyAnalytics);

/**
 * @swagger
 * /api/v1/mentors/me/dashboard:
 *   get:
 *     summary: Get my dashboard bundle
 *     description: Returns mentor row, analytics, and posts in one payload.
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MentorApiSuccess' }
 */
router.get('/mentors/me/dashboard', ...mentorAuth, bundleController.getMyDashboard);

/**
 * @swagger
 * /api/v1/mentors/me/edit-profile:
 *   get:
 *     summary: Get edit-profile page bundle
 *     description: Profile, portfolio, experience, skills, and catalog for the edit page.
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Edit profile bundle
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MentorApiSuccess' }
 */
router.get('/mentors/me/edit-profile', ...mentorAuth, bundleController.getMyEditProfile);

/**
 * @swagger
 * /api/v1/mentors/me/posts:
 *   get:
 *     summary: List my posts (all statuses)
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published] }
 *     responses:
 *       200:
 *         description: My posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/MentorPost' }
 */
router.get('/mentors/me/posts', ...mentorAuth, postsController.listMyPosts);

/**
 * @swagger
 * /api/v1/mentors:
 *   post:
 *     summary: Create mentor profile
 *     description: Creates profile for the authenticated mentor user.
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MentorCreateRequest' }
 *     responses:
 *       201:
 *         description: Mentor created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Mentor' }
 *       400:
 *         description: Profile already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/mentors', ...mentorAuth, mentorController.createMentor);

/**
 * @swagger
 * /api/v1/mentors/posts/{postId}:
 *   patch:
 *     summary: Update my mentor post
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MentorPostUpdateRequest' }
 *     responses:
 *       200:
 *         description: Post updated
 *       403:
 *         description: Forbidden — not post owner
 *       404:
 *         description: Post not found
 */
router.patch('/mentors/posts/:postId', ...mentorAuth, postsController.updatePost);

/**
 * @swagger
 * /api/v1/mentors/posts/{postId}:
 *   delete:
 *     summary: Delete my mentor post
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Post deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Post not found
 */
router.delete('/mentors/posts/:postId', ...mentorAuth, postsController.deletePost);

/**
 * @swagger
 * /api/v1/mentors/{userId}:
 *   get:
 *     summary: Get mentor by user id
 *     tags: [Mentors - Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mentor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Mentor' }
 *       404:
 *         description: Mentor not found
 */
router.get('/mentors/:userId', mentorController.getMentorById);

/**
 * @swagger
 * /api/v1/mentors/{userId}:
 *   put:
 *     summary: Update mentor profile
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MentorUpdateRequest' }
 *     responses:
 *       200:
 *         description: Mentor updated
 *       400:
 *         description: No fields to update
 *       403:
 *         description: Forbidden — not profile owner
 *       404:
 *         description: Mentor not found
 */
router.put('/mentors/:userId', ...mentorAuth, mentorController.updateMentor);

/**
 * @swagger
 * /api/v1/mentors/{userId}/profile-picture:
 *   post:
 *     summary: Upload mentor profile picture
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile_picture: { type: string }
 *       400:
 *         description: File required
 */
router.post(
  '/mentors/:userId/profile-picture',
  ...mentorAuth,
  profilePictureUpload.single('file'),
  mentorController.uploadProfilePicture
);

/**
 * @swagger
 * /api/v1/mentors/{userId}:
 *   delete:
 *     summary: Delete mentor profile
 *     description: Deletes mentor and related portfolio, skills, posts, experience.
 *     tags: [Mentors - Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mentor deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Mentor not found
 */
router.delete('/mentors/:userId', ...mentorAuth, mentorController.deleteMentor);

export default router;
