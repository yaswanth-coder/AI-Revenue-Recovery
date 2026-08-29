import mongoose from 'mongoose';
import { config } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected:', config.mongoUri);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}
