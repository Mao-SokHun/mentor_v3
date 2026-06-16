import express from 'express';
import { register, login, logout, profile } from '../../../controllers/auth/authControllers.js';
import { verifyOTP } from '../../../controllers/auth/verifyOTP.js';
import { resetPassword } from '../../../controllers/auth/resetPassword.js';
import { protect } from '../../../middleware/auth/auth.js';
import { forgotPassword } from '../../../controllers/auth/Forgot Password/forgotPassword.js';
import { setNewPassword } from '../../../controllers/auth/Forgot Password/setNewPassword.js';
import { verifyForgotOTP } from '../../../controllers/auth/Forgot Password/verifyForgotOtp.js';
import { authorize } from '../../../middleware/auth/rbacAuthorize.js';
import { deleteUser } from '../../../controllers/auth/deleteUser.js';
import { loginLimit } from '../../../middleware/auth/authLimit.js';
import { registerLimit } from '../../../middleware/auth/authLimit.js';
import { verifyRefreshToken } from '../../../middleware/auth/verifyRefreshToken.js';
import { refreshToken } from '../../../controllers/auth/Refresh Token/refreshToken.js';
import { logoutAll } from '../../../controllers/auth/Refresh Token/logoutAll.js';

const router = express.Router();

// register

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email, password, and user type
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post('/register', registerLimit ,register)

// login

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and receive JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful, token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginLimit ,login)

// logout

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: End user session and invalidate token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/logout', verifyRefreshToken,logout)

// verify otp (login)

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for login
 *     description: Verify OTP sent to user's email during login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerifyRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */
router.post('/verify-otp', verifyOTP)

// reset password

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Change user password (requires authentication)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['currentPassword', 'newPassword']
 *             properties:
 *               currentPassword: { type: 'string' }
 *               newPassword: { type: 'string', minLength: 6 }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       400:
 *         description: Invalid current password
 *       500:
 *         description: Server error
 */
router.post('/reset-password', protect, resetPassword )

// forgot password

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send OTP to user's email for password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['email']
 *             properties:
 *               email: { type: 'string', format: 'email' }
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', forgotPassword)

/**
 * @swagger
 * /api/auth/verify-forgot-otp:
 *   post:
 *     summary: Verify forgot password OTP
 *     description: Verify OTP sent for password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerifyRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */
router.post('/verify-forgot-otp', verifyForgotOTP)

/**
 * @swagger
 * /api/auth/set-new-password:
 *   post:
 *     summary: Set new password
 *     description: Set new password after OTP verification
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['email', 'newPassword']
 *             properties:
 *               email: { type: 'string', format: 'email' }
 *               newPassword: { type: 'string', minLength: 6 }
 *     responses:
 *       200:
 *         description: Password set successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/set-new-password', setNewPassword)

// who user profile

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve authenticated user's profile information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id: { type: 'integer' }
 *                 email: { type: 'string' }
 *                 user_type_id: { type: 'integer' }
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/profile', protect, profile)

/**
 * @swagger
 * /api/v1/auth/delete-user:
 *   delete:
 *     summary: Delete user account
 *     description: Delete the authenticated user's account (requires admin, teacher, or student role)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.delete(
  "/delete-user",
  protect,
  authorize("admin", "teacher", "student"),
  deleteUser
);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token cookie
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: 'string' }
 *       401:
 *         description: Unauthorized - invalid or missing refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh-token', verifyRefreshToken, refreshToken)

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Invalidate all refresh tokens for the user across all devices
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/logout-all', verifyRefreshToken, logoutAll)

export default router;