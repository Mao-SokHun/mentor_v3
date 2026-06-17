import express from 'express';

import mentorRoutes from './mentor/mentors.js';
import authRoutes from './auth/auth.js';
import userTypesRouter from './userTypes.js';
import stripeRoutes from './stripe.js';
import studentRouter from './students.js';
import usersProfileRoutes from './Users/UsersRoutes.js';
import { stripeWebhook } from '../../controllers/stripe/stripeWebhook.js';

const router = express.Router();

// 1. Raw body routes (Must be defined BEFORE express.json)
// Stripe webhook must receive the raw body for signature verification
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// 2. Apply standard JSON body parsers to all subsequent routes
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 3. Mount all standard JSON v1 routes
router.use('/', mentorRoutes);
router.use('/user-types', userTypesRouter);
router.use('/students', studentRouter);
router.use('/auth', authRoutes);
router.use('/stripe', stripeRoutes);
router.use('/users', usersProfileRoutes);

export default router;
