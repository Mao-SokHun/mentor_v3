import 'dotenv/config';
import sequelize from '../config/config.js';

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Drop all tables with CASCADE to handle foreign key constraints
    console.log('🗑️  Dropping all tables...');
    await sequelize.query('DROP SCHEMA public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    await sequelize.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('✅ All tables dropped');

    // Import models to register them with sequelize
    await import('../models/index.js');

    // Create all tables
    console.log('📝 Creating all tables...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully!');

    console.log('\n🎉 Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

resetDatabase();
