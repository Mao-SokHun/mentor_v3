import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as portfolioController from '../../../controllers/mentorSystem/mentorPortfolioController.js';
import { portfolioUpload } from '../../../middleware/mentorSystem/portfolioUpload.js';

const router = Router();

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio:
 *   get:
 *     summary: List mentor portfolio items
 *     tags: [Mentors - Portfolio]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Portfolio items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PortfolioItem' }
 */
router.get('/mentors/:userId/portfolio', portfolioController.listPortfolio);

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio:
 *   post:
 *     summary: Create portfolio item (link only)
 *     tags: [Mentors - Portfolio]
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
 *           schema: { $ref: '#/components/schemas/PortfolioCreateRequest' }
 *     responses:
 *       201:
 *         description: Portfolio item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/PortfolioItem' }
 *       400:
 *         description: Invalid link or duplicate
 */
router.post('/mentors/:userId/portfolio', ...mentorAuth, portfolioController.creatPortfolio);

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio/with-file:
 *   post:
 *     summary: Create portfolio item with file upload
 *     tags: [Mentors - Portfolio]
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
 *             required: [link, file]
 *             properties:
 *               link:
 *                 type: string
 *                 format: uri
 *                 example: https://github.com/mentor/project
 *               link_tag: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               portfolio_date: { type: string, format: date }
 *               technologies: { type: string, example: "React, Node.js" }
 *               item_type:
 *                 type: string
 *                 enum: [link, project, certificate, achievement]
 *               sort_order: { type: integer }
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Portfolio item created with file
 */
router.post(
  '/mentors/:userId/portfolio/with-file',
  ...mentorAuth,
  portfolioUpload.single('file'),
  portfolioController.createPortfolioWithFile
);

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio/{link}:
 *   patch:
 *     summary: Update portfolio item
 *     description: Path parameter `link` must be URL-encoded portfolio link.
 *     tags: [Mentors - Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: link
 *         required: true
 *         schema: { type: string }
 *         description: URL-encoded portfolio link
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PortfolioUpdateRequest' }
 *     responses:
 *       200:
 *         description: Portfolio item updated
 *       404:
 *         description: Portfolio item not found
 */
router.patch('/mentors/:userId/portfolio/:link', ...mentorAuth, portfolioController.updatePortfolio);

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio/{link}:
 *   delete:
 *     summary: Delete portfolio item
 *     tags: [Mentors - Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: link
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Portfolio item deleted
 *       404:
 *         description: Not found
 */
router.delete('/mentors/:userId/portfolio/:link', ...mentorAuth, portfolioController.deletePortfolio);

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio/{link}/files:
 *   get:
 *     summary: List files for a portfolio item
 *     tags: [Mentors - Portfolio]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: link
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: File list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PortfolioFile' }
 */
router.get('/mentors/:userId/portfolio/:link/files', portfolioController.listPortfolioFiles);

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio/{link}/files:
 *   post:
 *     summary: Upload file to portfolio item
 *     tags: [Mentors - Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: link
 *         required: true
 *         schema: { type: string }
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
 *       201:
 *         description: File uploaded
 */
router.post(
  '/mentors/:userId/portfolio/:link/files',
  ...mentorAuth,
  portfolioUpload.single('file'),
  portfolioController.uploadPortfolioFile
);

/**
 * @swagger
 * /api/v1/mentors/{userId}/portfolio/{link}/files/{fileId}:
 *   delete:
 *     summary: Delete portfolio file
 *     tags: [Mentors - Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: link
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: File deleted
 *       404:
 *         description: File not found
 */
router.delete(
  '/mentors/:userId/portfolio/:link/files/:fileId',
  ...mentorAuth,
  portfolioController.deletePortfolioFile
);

export default router;
