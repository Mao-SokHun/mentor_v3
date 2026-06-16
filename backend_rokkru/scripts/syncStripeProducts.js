import 'dotenv/config';
import stripe from '../config/stripe.js';
import sequelize from '../config/config.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';

// Payment links to sync
const paymentLinks = [
    'https://buy.stripe.com/test_7sY4gz1uccbFd53eUV',
    'https://buy.stripe.com/test_7sY4gz2yga3x9SR39H'
];

async function syncStripeProducts() {
    try {
        if (!stripe) {
            throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
        }

        await sequelize.authenticate();
        console.log('✅ Connected to database');
        console.log('🔄 Fetching products from Stripe...\n');

        // Fetch all products from Stripe
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price']
        });

        console.log(`📦 Found ${products.data.length} active products in Stripe\n`);

        const plansToCreate = [];

        for (const product of products.data) {
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
            console.log(`   Product ID: ${product.id}`);

            // Check if plan already exists
            const existingPlan = await SubscriptionPlan.findOne({
                where: { name: product.name }
            });

            if (existingPlan) {
                console.log(`   ⚠️  Already exists in database (ID: ${existingPlan.subscription_Plan_id})`);
                console.log(`   Updating price: $${existingPlan.price} → $${amount}\n`);

                existingPlan.price = amount;
                existingPlan.description = product.description || existingPlan.description;
                await existingPlan.save();
            } else {
                plansToCreate.push({
                    name: product.name,
                    price: amount,
                    duration_day: 30, // Default 30 days subscription
                    description: product.description || `${product.name} subscription plan`
                });
                console.log(`   ✅ Will be added to database\n`);
            }
        }

        // Create new plans
        if (plansToCreate.length > 0) {
            const createdPlans = await SubscriptionPlan.bulkCreate(plansToCreate);
            console.log(`\n🎉 Created ${createdPlans.length} new plans:`);
            createdPlans.forEach(plan => {
                console.log(`   - ${plan.name}: $${plan.price} (ID: ${plan.subscription_Plan_id})`);
            });
        } else {
            console.log('\n📋 No new plans to create - all products already synced');
        }

        // Show final summary
        console.log('\n📊 Final Database Summary:');
        const allPlans = await SubscriptionPlan.findAll({
            attributes: ['subscription_Plan_id', 'name', 'price', 'duration_day'],
            order: [['subscription_Plan_id', 'ASC']]
        });

        console.log('\n╔═══════════════════════════════════════════════════╗');
        console.log('║            SUBSCRIPTION PLANS IN DATABASE         ║');
        console.log('╠════╦════════════════════════╦══════════╦══════════╣');
        console.log('║ ID ║ Name                   ║ Price    ║ Duration ║');
        console.log('╠════╬════════════════════════╬══════════╬══════════╣');
        allPlans.forEach(plan => {
            const id = String(plan.subscription_Plan_id).padEnd(2);
            const name = plan.name.padEnd(22);
            const price = `$${plan.price}`.padEnd(8);
            const duration = `${plan.duration_day} days`.padEnd(8);
            console.log(`║ ${id} ║ ${name} ║ ${price} ║ ${duration} ║`);
        });
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

syncStripeProducts();
