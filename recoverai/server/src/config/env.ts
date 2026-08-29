import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current working dir, server dir, or recoverai root dir
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/recoverai',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gemini-pro',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  demoMode: process.env.DEMO_MODE !== 'false',
  smtpService: process.env.SMTP_SERVICE || '',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
};
