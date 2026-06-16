import express from 'express';
const router = express.Router();
import * as userTypesController from '../../controllers/userTypesController.js';
import { getUserTypes, createUserType } from '../../controllers/userTypesController.js';
/**
 * @openapi
 * /api/v1/user-types:
 *   get:
 *     summary: Retrieve all user types
 *     tags: [UserTypes]
 *     responses:
 *       200:
 *         description: A list of user types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserType'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/', getUserTypes);

/**
 * @openapi
 * /api/v1/user-types:
 *   post:
 *     summary: Create a new user type
 *     tags: [UserTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_type_name
 *             properties:
 *               user_type_name:
 *                 type: string
 *                 description: The name of the new user type (e.g. Mentor)
 *     responses:
 *       201:
 *         description: The created user type object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserType'
 *       400:
 *         description: Invalid inputs provided
 *       500:
 *         description: Internal server error
 */
router.post('/', createUserType);

export default router;
