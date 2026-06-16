import 'dotenv/config';
import sequelize from '../config/config.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';

async function seedPlans() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Check if plans already exist
        const existingPlans = await SubscriptionPlan.findAll();
        if (existingPlans.length > 0) {
            console.log('📋 Plans already exist:');
            existingPlans.forEach(plan => {
                console.log(`  - ${plan.name}: $${plan.price}`);
            });
            process.exit(0);
        }

        // Create sample plans
        const plans = await SubscriptionPlan.bulkCreate([
            {
                name: 'Starter',
                price: 4.99,
                duration_day: 30,
                description: 'Perfect for getting started',
            },
            {
                name: 'Professional',
                price: 19.99,
                duration_day: 30,
                description: 'Most popular - full access',
            },
            {
                name: 'Business',
                price: 49.99,
                duration_day: 30,
                description: 'For growing teams',
            },
            {
                name: 'Enterprise',
                price: 99.99,
                duration_day: 30,
                description: 'For large organizations',
            }
        ]);

        console.log('✅ Created sample subscription plans:');
        plans.forEach(plan => {
            console.log(`  - ${plan.name}: $${plan.price} (ID: ${plan.subscription_Plan_id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedPlans();
