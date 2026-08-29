import mongoose from 'mongoose';
import { config } from '../config/env';
import User from '../models/User';

async function clearAllUsers() {
  try {
    console.log(`Connecting to MongoDB at: ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to database.');

    const countBefore = await User.countDocuments();
    console.log(`Found ${countBefore} existing user account(s).`);

    const result = await User.deleteMany({});
    console.log(`🧹 Successfully removed ${result.deletedCount} user(s) from MongoDB!`);

    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing users:', err);
    process.exit(1);
  }
}

clearAllUsers();
