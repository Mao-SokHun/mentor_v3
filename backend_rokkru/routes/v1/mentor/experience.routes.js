import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as experienceController from '../../../controllers/mentor_system/mentorExperienceController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/mentors/{userId}/experience:
 *   get:
 *     summary: List mentor experience
 *     tags: [Mentors - Experience]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Experience list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/MentorExperience' }
 *       404:
 *         description: Mentor not found
 */
router.get('/mentors/:userId/experience', experienceController.listExperience);

/**
 * @swagger
 * /api/v1/mentors/{userId}/experience:
 *   post:
 *     summary: Add mentor experience
 *     tags: [Mentors - Experience]
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
 *           schema: { $ref: '#/components/schemas/MentorExperienceCreateRequest' }
 *     responses:
 *       201:
 *         description: Experience created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/MentorExperience' }
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/mentors/:userId/experience', ...mentorAuth, experienceController.createExperience);

/**
 * @swagger
 * /api/v1/mentors/{userId}/experience/{experienceId}:
 *   patch:
 *     summary: Update mentor experience
 *     tags: [Mentors - Experience]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MentorExperienceUpdateRequest' }
 *     responses:
 *       200:
 *         description: Experience updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Experience not found
 */
router.patch(
  '/mentors/:userId/experience/:experienceId',
  ...mentorAuth,
  experienceController.updateExperience
);

/**
 * @swagger
 * /api/v1/mentors/{userId}/experience/{experienceId}:
 *   delete:
 *     summary: Delete mentor experience
 *     tags: [Mentors - Experience]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Experience deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Experience not found
 */
router.delete(
  '/mentors/:userId/experience/:experienceId',
  ...mentorAuth,
  experienceController.deleteExperience
);

export default router;
