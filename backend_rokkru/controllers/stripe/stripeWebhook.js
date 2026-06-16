import stripe from '../../config/stripe.js';
import StripePayment from '../../models/stripePaymentModel.js';
import TransactionDetail from '../../models/transactionDetailModel.js';
import { activateSubscription } from '../../utils/stripe/subscriptionHelper.js';
import { fromStripeAmount } from '../../utils/stripe/stripeAmounts.js';

function getStripeId(value) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

async function handleCheckoutCompleted(session) {
  console.log('📥 Webhook received: checkout.session.completed');
  console.log('Session ID:', session.id);
  console.log('Customer Email:', session.customer_details?.email);
  console.log('Amount:', session.amount_total);

  if (session.payment_status !== 'paid') {
    await StripePayment.update(
      { status: session.payment_status || 'unpaid', update_date: new Date() },
      { where: { stripe_checkout_session_id: session.id } },
    );
    return null;
  }

  const userId = Number(session.metadata?.user_id);
  const subscriptionPlanId = Number(session.metadata?.subscription_plan_id);
  const userTypeId = session.metadata?.user_type_id
    ? Number(session.metadata.user_type_id)
    : null;

  // If no metadata (e.g., from Buy Button), just log the payment
  if (!userId || !subscriptionPlanId) {
    console.warn('⚠️  No metadata found - likely from Buy Button');
    console.log('💡 Creating generic payment record...');

    // Create a generic payment record without user association
    await StripePayment.create({
      user_id: null, // No user ID from Buy Button
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: getStripeId(session.payment_intent),
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      status: 'completed',
      create_date: new Date(),
      update_date: new Date(),
    }).catch(err => {
      // If record already exists, that's ok
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Payment record already exists');
      } else {
        throw err;
      }
    });

    // Log for admin review
    console.log('✅ Payment recorded (manual user assignment needed)');
    console.log('   Email:', session.customer_details?.email);
    console.log('   Amount: $' + (session.amount_total / 100).toFixed(2));

    return null;
  }

  // Original logic for API checkout sessions with metadata
  const payment = await StripePayment.findOne({
    where: { stripe_checkout_session_id: session.id },
  });

  if (!payment) {
    throw new Error(`Stripe payment record not found for session ${session.id}`);
  }

  if (payment.status === 'completed') {
    return payment;
  }

  const subscription = await activateSubscription({
    userId,
    subscriptionPlanId,
    userTypeId,
  });

  payment.subscription_id = subscription.subscription_id;
  payment.stripe_payment_intent_id = getStripeId(session.payment_intent);
  payment.amount = fromStripeAmount(session.amount_total, session.currency);
  payment.currency = session.currency || payment.currency;
  payment.status = 'completed';
  payment.update_date = new Date();

  // Get receipt URL from payment intent
  try {
    const paymentIntentId = getStripeId(session.payment_intent);
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const chargeId = getStripeId(paymentIntent.latest_charge);

      if (chargeId) {
        const charge = await stripe.charges.retrieve(chargeId);
        payment.stripe_receipt_url = charge.receipt_url; // Save receipt URL
        console.log('✅ Receipt URL saved:', charge.receipt_url);
      }
    }
  } catch (error) {
    console.error('⚠️  Could not retrieve receipt URL:', error.message);
  }

  await payment.save();

  await TransactionDetail.create({
    user_id: userId,
    subscription_id: subscription.subscription_id,
    bank_tx_id: getStripeId(session.payment_intent),
    remark: `Stripe checkout ${session.id}`,
    paid_account: session.customer_details?.email || null,
  });

  return payment;
}
export const stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).send('Stripe is not configured');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).send('STRIPE_WEBHOOK_SECRET is not configured');
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'checkout.session.expired': {
        const session = event.data.object;
        await StripePayment.update(
          { status: 'expired', update_date: new Date() },
          { where: { stripe_checkout_session_id: session.id } },
        );
        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return res.status(500).json({ message: error.message });
  }
};
