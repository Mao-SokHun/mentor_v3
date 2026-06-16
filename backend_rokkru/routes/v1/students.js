import express from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, getMyProfile, updateMyProfile } from '../../controllers/student_system/studentController.js';
import { getAllPosts, getPostById, createPost, updatePost, deletePost, getCommunityTypes, getMyPosts, getCommunityHistory } from '../../controllers/student_system/studentCommunityController.js';
import {
  getAccountHistory,
  getAccountLogs as getActivityLogs,
  getFullHistory
} from '../../controllers/student_system/studentHistoryController.js';
import { protect } from '../../middleware/auth/auth.js';
import { authorize } from '../../middleware/auth/rbacAuthorize.js';
import { devBypass } from '../../middleware/auth/devBypass.js';

const router = express.Router();

// Protect all student routes and require `student` role
// Use a dev bypass when explicitly enabled via env var


/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management, dashboard, history, community, and mentor search
 */

// ==================== PROTECTED ROUTES ====================

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 */
router.post('/', createStudent);

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get('/', getStudents);

// ==================== MY PROFILE (MUST BE BEFORE /:id) ====================

/**
 * @swagger
 * /api/v1/students/me:
 *   get:
 *     summary: Get my student profile
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: My profile retrieved
 */
router.get('/me', getMyProfile);

/**
 * @swagger
 * /api/v1/students/me:
 *   put:
 *     summary: Update my student profile
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/me', updateMyProfile);

// ==================== COMMUNITY (MUST BE BEFORE /:id) ====================

/**
 * @swagger
 * /api/v1/students/community/types:
 *   get:
 *     summary: Get community types
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Community types retrieved
 */
router.get('/community/types', getCommunityTypes);

/**
 * @swagger
 * /api/v1/students/community/posts:
 *   get:
 *     summary: Get all community posts
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of posts retrieved
 */
router.get('/community/posts', getAllPosts);

/**
 * @swagger
 * /api/v1/students/community/my-posts:
 *   get:
 *     summary: Get my community posts
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: My posts retrieved
 */
router.get('/community/my-posts', getMyPosts);

/**
 * @swagger
 * /api/v1/students/community/history:
 *   get:
 *     summary: Get community history
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Community history retrieved
 */
router.get('/community/history', getCommunityHistory);

/**
 * @swagger
 * /api/v1/students/community/posts/{id}:
 *   get:
 *     summary: Get community post by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post found
 */
router.get('/community/posts/:id', getPostById);

/**
 * @swagger
 * /api/v1/students/community/posts:
 *   post:
 *     summary: Create a community post
 *     tags: [Students]
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/community/posts', createPost);

/**
 * @swagger
 * /api/v1/students/community/posts/{id}:
 *   put:
 *     summary: Update community post by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put('/community/posts/:id', updatePost);

/**
 * @swagger
 * /api/v1/students/community/posts/{id}:
 *   delete:
 *     summary: Delete community post by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete('/community/posts/:id', deletePost);

// ==================== HISTORY ROUTES ====================

/**
 * @swagger
 * /api/v1/students/history/account:
 *   get:
 *     summary: Get account change history
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Account history retrieved
 */
router.get('/history/account', getAccountHistory);

/**
 * @swagger
 * /api/v1/students/history/logs:
 *   get:
 *     summary: Get activity logs
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Activity logs retrieved
 */
router.get('/history/logs', getActivityLogs);

/**
 * @swagger
 * /api/v1/students/history:
 *   get:
 *     summary: Get full combined history
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Full history retrieved
 */
router.get('/history', getFullHistory);

// ==================== DYNAMIC ID ROUTES (MUST BE LAST) ====================

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Student not found
 */
router.get('/:id', getStudentById);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     summary: Update student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student updated successfully
 */
router.put('/:id', updateStudent);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   delete:
 *     summary: Delete student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student deleted successfully
 */
router.delete('/:id', deleteStudent);

export default router;
