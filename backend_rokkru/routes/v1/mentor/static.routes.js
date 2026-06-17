import { Router } from 'express';
import * as portfolioController from '../../../controllers/mentorSystem/mentorPortfolioController.js';
import * as mentorController from '../../../controllers/mentorSystem/mentorController.js';
import * as skillsController from '../../../controllers/mentorSystem/mentorSkillsController.js';
import * as provinceController from '../../../controllers/mentorSystem/provinceController.js';
import * as postsController from '../../../controllers/mentorSystem/mentorPostsController.js';
import * as profileViewController from '../../../controllers/mentorSystem/mentorProfileViewController.js';
import * as bundleController from '../../../controllers/mentorSystem/mentorBundleController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/portfolio-files/{mentorId}/{filename}:
 *   get:
 *     summary: Download a mentor portfolio file
 *     description: Public file download for portfolio attachments.
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: filename
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: File content
 *       400:
 *         description: Invalid mentor id or filename
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MentorApiError' }
 *       404:
 *         description: File not found
 */
router.get('/portfolio-files/:mentorId/:filename', portfolioController.servePortfolioFile);

/**
 * @swagger
 * /api/v1/profile-pictures/{userId}/{filename}:
 *   get:
 *     summary: Get mentor profile picture
 *     description: Public profile image file for a mentor.
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: filename
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image file
 *       400:
 *         description: Invalid user id
 *       404:
 *         description: File not found
 */
router.get('/profile-pictures/:userId/:filename', mentorController.serveProfilePicture);

/**
 * @swagger
 * /api/v1/mentors/catalog:
 *   get:
 *     summary: Get skills and provinces catalog
 *     description: Skills with sub-skills and provinces for filters and onboarding.
 *     tags: [Mentors - Public]
 *     responses:
 *       200:
 *         description: Catalog retrieved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MentorCatalogResponse' }
 *       500:
 *         description: Server error
 */
router.get('/mentors/catalog', bundleController.getCatalog);

/**
 * @swagger
 * /api/v1/mentors:
 *   get:
 *     summary: List mentors
 *     description: Paginated mentor list with optional search and skill filters.
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search firstname, lastname, or description
 *       - in: query
 *         name: skillId
 *         schema: { type: integer }
 *       - in: query
 *         name: subSkillId
 *         schema: { type: integer }
 *       - in: query
 *         name: minExperience
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mentor list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MentorListResponse' }
 *       500:
 *         description: Server error
 */
router.get('/mentors', mentorController.listMentors);

/**
 * @swagger
 * /api/v1/mentors/search:
 *   get:
 *     summary: Search mentors
 *     description: Same as list mentors — supports q, skillId, subSkillId, minExperience, page, limit.
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: skillId
 *         schema: { type: integer }
 *       - in: query
 *         name: subSkillId
 *         schema: { type: integer }
 *       - in: query
 *         name: minExperience
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MentorListResponse' }
 */
router.get('/mentors/search', mentorController.searchMentors);

/**
 * @swagger
 * /api/v1/mentors/skill/listAllSkill:
 *   get:
 *     summary: List all skills with sub-skills
 *     tags: [Mentors - Public]
 *     responses:
 *       200:
 *         description: Skill catalog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Skill' }
 */
router.get('/mentors/skill/listAllSkill', skillsController.listSkill);

/**
 * @swagger
 * /api/v1/mentors/provinces/listAll:
 *   get:
 *     summary: List all provinces
 *     tags: [Mentors - Public]
 *     responses:
 *       200:
 *         description: Province list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Province' }
 */
router.get('/mentors/provinces/listAll', provinceController.listAllProvinces);

/**
 * @swagger
 * /api/v1/mentors/posts:
 *   get:
 *     summary: List published mentor posts
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published] }
 *       - in: query
 *         name: province_id
 *         schema: { type: integer }
 *       - in: query
 *         name: sub_skill_id
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 200 }
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
 */
router.get('/mentors/posts', postsController.listPublishedPosts);

/**
 * @swagger
 * /api/v1/mentors/posts/{postId}:
 *   get:
 *     summary: Get mentor post by id
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/MentorPost' }
 *       404:
 *         description: Post not found
 */
router.get('/mentors/posts/:postId', postsController.getPostById);

/**
 * @swagger
 * /api/v1/mentors/posts/{postId}/legacy:
 *   get:
 *     summary: Get mentor post by id (legacy)
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/mentors/posts/:postId/legacy', postsController.getPostByIdLegacy);

/**
 * @swagger
 * /api/v1/mentors/{userId}/profile-views:
 *   post:
 *     summary: Record mentor profile view
 *     description: Increments profile_view_count. Self-views are not counted.
 *     tags: [Mentors - Public]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: View recorded or skipped
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProfileViewResponse' }
 *       404:
 *         description: Mentor not found
 */
router.post('/mentors/:userId/profile-views', profileViewController.recordProfileView);

export default router;
