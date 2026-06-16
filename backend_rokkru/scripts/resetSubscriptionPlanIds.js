import 'dotenv/config';
import { sequelize } from '../models/index.js';

console.log('═══════════════════════════════════════════════════════');
console.log('🔄 RESETTING SUBSCRIPTION_PLAN IDs');
console.log('═══════════════════════════════════════════════════════\n');

async function resetPlanIds() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        console.log('📋 Step 1: Delete all subscription plans...');
        await sequelize.query('DELETE FROM "subscription_Plan" CASCADE;');
        console.log('   ✅ All plans deleted\n');

        console.log('📋 Step 2: Reset ID sequence to start from 1...');
        await sequelize.query('ALTER SEQUENCE "subscription_Plan_subscription_Plan_id_seq" RESTART WITH 1;');
        console.log('   ✅ ID sequence reset to 1\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ RESET COMPLETED!');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('💡 Next steps:');
        console.log('   1. Run seed script to add plans:');
        console.log('      node scripts/seedSpecificLinks.js');
        console.log('   2. New plans will start from ID = 1\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ RESET FAILED!');
        console.error('Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

resetPlanIds();
