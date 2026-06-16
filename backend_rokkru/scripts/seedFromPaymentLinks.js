import 'dotenv/config';
import stripe from '../config/stripe.js';
import sequelize from '../config/config.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';

// Your payment links
const paymentLinks = [
    'https://buy.stripe.com/test_7sY4gz1uccbFd53eUV',
    'https://buy.stripe.com/test_7sY4gz2yga3x9SR39H'
];

// Extract buy button IDs from payment links
function extractBuyButtonId(url) {
    const match = url.match(/\/test_([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
}

async function seedFromPaymentLinks() {
    try {
        if (!stripe) {
            throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
        }

        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Delete all existing plans
        const deletedCount = await SubscriptionPlan.destroy({ where: {} });
        console.log(`🗑️  Deleted ${deletedCount} old plans\n`);

        console.log('🔄 Fetching products from your payment links...\n');

        // Fetch all products from Stripe
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price']
        });

        console.log(`📦 Found ${products.data.length} total products in Stripe\n`);

        const plansToCreate = [];

        // Get the latest 2 products (your payment links)
        // Since we can't directly fetch by payment link, we'll get the most recent ones
        const recentProducts = products.data.slice(0, 2);

        for (const product of recentProducts) {
            const price = product.default_price;

            // Skip if no price
            if (!price || typeof price === 'string') {
                console.log(`⏭️  Skipping ${product.name} - no default price`);
                continue;
            }

            const amount = price.unit_amount / 100; // Convert cents to dollars
            const currency = price.currency.toUpperCase();

            console.log(`📋 Product: ${product.name}`);
            console.log(`   Price: $${amount} ${currency}`);
            console.log(`   Price ID: ${price.id}`);
            console.log(`   Product ID: ${product.id}\n`);

            plansToCreate.push({
                name: product.name,
                price: amount,
                duration_day: 30, // Default 30 days subscription
                description: product.description || `${product.name} subscription plan`
            });
        }

        // Create plans
        if (plansToCreate.length > 0) {
            const createdPlans = await SubscriptionPlan.bulkCreate(plansToCreate);
            console.log(`✅ Created ${createdPlans.length} plans from your payment links:\n`);
            createdPlans.forEach(plan => {
                console.log(`   ID ${plan.subscription_Plan_id}: ${plan.name} - $${plan.price}`);
            });
        } else {
            console.log('❌ No products found to seed');
        }

        // Show final summary
        console.log('\n╔═══════════════════════════════════════════════════╗');
        console.log('║       SUBSCRIPTION PLANS IN DATABASE              ║');
        console.log('╠════╦════════════════════════╦══════════╦══════════╣');
        console.log('║ ID ║ Name                   ║ Price    ║ Duration ║');
        console.log('╠════╬════════════════════════╬══════════╬══════════╣');

        const allPlans = await SubscriptionPlan.findAll({
            order: [['subscription_Plan_id', 'ASC']]
        });

        if (allPlans.length === 0) {
            console.log('║    ║ (empty)                ║          ║          ║');
        } else {
            allPlans.forEach(plan => {
                const id = String(plan.subscription_Plan_id).padEnd(2);
                const name = (plan.name || '').substring(0, 22).padEnd(22);
                const price = `$${plan.price}`.padEnd(8);
                const duration = `${plan.duration_day}d`.padEnd(8);
                console.log(`║ ${id} ║ ${name} ║ ${price} ║ ${duration} ║`);
            });
        }

        console.log('╚════╩════════════════════════╩══════════╩══════════╝\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.type === 'StripeAuthenticationError') {
            console.error('   → Check your STRIPE_SECRET_KEY in .env');
        }
        process.exit(1);
    }
}

seedFromPaymentLinks();
