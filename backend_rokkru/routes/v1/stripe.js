import express from 'express';
import { protect } from '../../middleware/auth/auth.js';
import {
  createCheckoutSession,
  getCheckoutSession,
  getStripeConfig,
  listSubscriptionPlans,
  getReceipt,
} from '../../controllers/stripe/stripeController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/stripe/config:
 *   get:
 *     summary: Get Stripe publishable key for the frontend
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Stripe publishable key
 */
router.get('/config', getStripeConfig);

/**
 * @swagger
 * /api/v1/stripe/plans:
 *   get:
 *     summary: List subscription plans available for Stripe checkout
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: List of subscription plans
 */
router.get('/plans', listSubscriptionPlans);

/**
 * @swagger
 * /api/v1/stripe/create-checkout-session:
 *   post:
 *     summary: Create a Stripe Checkout session for a subscription plan
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subscription_plan_id]
 *             properties:
 *               subscription_plan_id: { type: integer }
 *               success_url:
 *                 type: string
 *                 example: http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}
 *               cancel_url:
 *                 type: string
 *                 example: http://localhost:5173/payment/cancel
 *     responses:
 *       201:
 *         description: Checkout session created
 */
router.post('/create-checkout-session', createCheckoutSession);

/**
 * @swagger
 * /api/v1/stripe/session/{sessionId}:
 *   get:
 *     summary: Get checkout session payment status
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session status
 */
router.get('/session/:sessionId', getCheckoutSession);

/**
 * @swagger
 * /api/v1/stripe/receipt/{payment_id}:
 *   get:
 *     summary: Get payment receipt/invoice URL
 *     tags: [Stripe]
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         schema: { type: integer }
 *         description: Payment ID from database
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *         description: User ID for verification (optional)
 *     responses:
 *       200:
 *         description: Receipt information with Stripe-hosted URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payment_id: { type: integer }
 *                 amount: { type: number }
 *                 currency: { type: string }
 *                 status: { type: string }
 *                 receipt_url: { type: string, description: "Stripe-hosted receipt URL" }
 *                 created_at: { type: string, format: date-time }
 */
router.get('/receipt/:payment_id', getReceipt);

export default router;
