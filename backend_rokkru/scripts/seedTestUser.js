import 'dotenv/config';
import sequelize from '../config/config.js';
import User from '../models/userModel.js';
import UserType from '../models/userTypeModel.js';
import bcrypt from 'bcryptjs';

async function seedTestUser() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Ensure user_type exists
        let userType = await UserType.findByPk(1);
        if (!userType) {
            userType = await UserType.create({
                user_type_id: 1,
                user_type_name: 'Student'
            });
            console.log('✅ Created user type: Student');
        }

        // Check if test user already exists
        const existingUser = await User.findByPk(1);
        if (existingUser) {
            console.log('📋 Test user already exists:');
            console.log(`  ID: ${existingUser.user_id}`);
            console.log(`  Email: ${existingUser.email}`);
            process.exit(0);
        }

        // Create test user
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        const user = await User.create({
            user_id: 1,
            user_type_id: 1,
            email: 'test@rokkru.com',
            password: hashedPassword,
            is_verified: true
        });

        console.log('✅ Created test user:');
        console.log(`  ID: ${user.user_id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password: Test123!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedTestUser();
