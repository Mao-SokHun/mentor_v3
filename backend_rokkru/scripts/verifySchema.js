import 'dotenv/config';
import sequelize from '../config/config.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';

async function verifySchema() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        // Get table description
        const [results] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_Plan'
            ORDER BY ordinal_position;
        `);

        console.log('📋 subscription_Plan table structure:\n');
        console.log('╔═══════════════════════════╦═══════════════╦═══════════╗');
        console.log('║ Column Name               ║ Data Type     ║ Nullable  ║');
        console.log('╠═══════════════════════════╬═══════════════╬═══════════╣');

        results.forEach(col => {
            const name = col.column_name.padEnd(25);
            const type = col.data_type.padEnd(13);
            const nullable = col.is_nullable.padEnd(9);
            console.log(`║ ${name} ║ ${type} ║ ${nullable} ║`);
        });

        console.log('╚═══════════════════════════╩═══════════════╩═══════════╝\n');

        // Check if admin_id exists
        const hasAdminId = results.some(col => col.column_name === 'admin_id');

        if (hasAdminId) {
            console.log('❌ admin_id column still exists!');
        } else {
            console.log('✅ admin_id column successfully removed!');
        }

        // Show sample data
        const plans = await SubscriptionPlan.findAll();
        console.log(`\n📦 Total plans in database: ${plans.length}\n`);

        plans.forEach(plan => {
            console.log(`   - ${plan.name} ($${plan.price})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifySchema();
