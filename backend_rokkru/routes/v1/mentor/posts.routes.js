import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as postsController from '../../../controllers/mentorSystem/mentorPostsController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/mentors/{userId}/posts:
 *   get:
 *     summary: List posts by mentor
 *     description: Returns published posts by default. Drafts visible only to the owning mentor.
 *     tags: [Mentors - Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published] }
 *     responses:
 *       200:
 *         description: Post list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/MentorPost' }
 *       403:
 *         description: Forbidden — draft access denied
 */
router.get('/mentors/:userId/posts', postsController.listPost);

/**
 * @swagger
 * /api/v1/mentors/{userId}/posts:
 *   post:
 *     summary: Create mentor post
 *     tags: [Mentors - Posts]
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
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MentorPostCreateRequest' }
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/MentorPost' }
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden
 */
router.post('/mentors/:userId/posts', ...mentorAuth, postsController.createPost);

export default router;
