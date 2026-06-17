import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as skillsController from '../../../controllers/mentorSystem/mentorSkillsController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/mentors/{userId}/skills:
 *   get:
 *     summary: List mentor skills
 *     tags: [Mentors - Skills]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mentor skills with skill and sub-skill names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/MentorSkill' }
 *       400:
 *         description: Invalid user id
 */
router.get('/mentors/:userId/skills', skillsController.listMentorSkills);

/**
 * @swagger
 * /api/v1/mentors/{userId}/skills:
 *   post:
 *     summary: Add skill to mentor profile
 *     tags: [Mentors - Skills]
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
 *           schema: { $ref: '#/components/schemas/MentorSkillAddRequest' }
 *     responses:
 *       201:
 *         description: Skill added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/MentorSkill' }
 *       200:
 *         description: Skill already exists (idempotent)
 *       400:
 *         description: Invalid sub_skill_id or skill mismatch
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sub-skill not found
 */
router.post('/mentors/:userId/skills', ...mentorAuth, skillsController.addMentorSkill);

/**
 * @swagger
 * /api/v1/mentors/{userId}/skills/{subSkillId}:
 *   delete:
 *     summary: Remove skill from mentor profile
 *     tags: [Mentors - Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: subSkillId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Skill removed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Skill not found
 */
router.delete('/mentors/:userId/skills/:subSkillId', ...mentorAuth, skillsController.deleteMentorSkill);

export default router;
