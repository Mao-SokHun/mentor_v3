import Stripe from 'stripe';
import 'dotenv/config';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn('⚠️  STRIPE_SECRET_KEY is not set — Stripe endpoints will fail until configured.');
}

const stripe = secretKey ? new Stripe(secretKey) : null;

export default stripe;
