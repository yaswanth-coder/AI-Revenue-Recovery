import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env
const envPaths = [
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    console.log(`Loaded .env from: ${p}`);
    break;
  }
}

async function testGmailSmtp() {
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  const cleanPass = rawPass?.replace(/\s+/g, '');

  console.log(`\n--- SMTP DIAGNOSTIC TEST ---`);
  console.log(`SMTP_USER: "${user}"`);
  console.log(`SMTP_PASS (raw length): ${rawPass?.length}`);
  console.log(`SMTP_PASS (clean length): ${cleanPass?.length}`);

  if (!user || !cleanPass) {
    console.error('❌ SMTP_USER or SMTP_PASS is missing in .env');
    return;
  }

  // Method 1: Using service 'gmail'
  console.log('\nTesting Method 1: service = "gmail"...');
  try {
    const transporter1 = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass: cleanPass,
      },
    });
    await transporter1.verify();
    console.log('✅ Method 1 (service: gmail) VERIFIED SUCCESSFUL!');

    const sendRes = await transporter1.sendMail({
      from: `"RecoverAI Test" <${user}>`,
      to: user,
      subject: 'RecoverAI Live SMTP Diagnostic Test',
      text: 'If you receive this, Gmail SMTP is working 100% properly!',
      html: '<h3>RecoverAI Live SMTP Test</h3><p>If you receive this, Gmail SMTP is working 100% properly!</p>',
    });
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY! MessageId:', sendRes.messageId);
    return;
  } catch (err: any) {
    console.error('❌ Method 1 Failed:', err.message);
  }

  // Method 2: Using smtp.gmail.com port 465 (SSL)
  console.log('\nTesting Method 2: smtp.gmail.com on port 465 (SSL)...');
  try {
    const transporter2 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass: cleanPass,
      },
    });
    await transporter2.verify();
    console.log('✅ Method 2 (port 465 SSL) VERIFIED SUCCESSFUL!');

    const sendRes = await transporter2.sendMail({
      from: `"RecoverAI Test" <${user}>`,
      to: user,
      subject: 'RecoverAI Live SMTP Diagnostic Test (Port 465)',
      text: 'If you receive this, Gmail SMTP on port 465 is working 100% properly!',
    });
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY! MessageId:', sendRes.messageId);
    return;
  } catch (err: any) {
    console.error('❌ Method 2 Failed:', err.message);
  }

  // Method 3: Using smtp.gmail.com port 587 (TLS/STARTTLS)
  console.log('\nTesting Method 3: smtp.gmail.com on port 587 (STARTTLS)...');
  try {
    const transporter3 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user,
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter3.verify();
    console.log('✅ Method 3 (port 587 STARTTLS) VERIFIED SUCCESSFUL!');

    const sendRes = await transporter3.sendMail({
      from: `"RecoverAI Test" <${user}>`,
      to: user,
      subject: 'RecoverAI Live SMTP Diagnostic Test (Port 587)',
      text: 'If you receive this, Gmail SMTP on port 587 is working 100% properly!',
    });
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY! MessageId:', sendRes.messageId);
    return;
  } catch (err: any) {
    console.error('❌ Method 3 Failed:', err.message);
  }
}

testGmailSmtp();
