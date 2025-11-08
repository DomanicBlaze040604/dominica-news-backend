// Quick script to seed admin user on Railway
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dominicanews.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pass@12345';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'user'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  refreshTokens: [{ type: String }],
  loginAttempts: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      
      // Update password if needed
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      existingAdmin.passwordHash = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.loginAttempts = 0;
      existingAdmin.lockUntil = undefined;
      await existingAdmin.save();
      console.log('✅ Admin password and settings updated');
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      const admin = new User({
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
        fullName: ADMIN_NAME,
        role: 'admin',
        isActive: true,
        refreshTokens: [],
        loginAttempts: 0,
      });
      
      await admin.save();
      console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    }

    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
