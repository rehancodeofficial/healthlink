/**
 * Diagnostic script to test Gmail SMTP connectivity.
 * Run with: node test_email.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('--- SMTP Diagnostic Tool ---');
console.log('Provider:', process.env.EMAIL_PROVIDER);
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('User:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, 
});

async function runTest() {
  try {
    console.log('Attempting to verify connection...');
    await transporter.verify();
    console.log('✅ Connection verified! SMTP is working.');

    console.log('Attempting to send test email to sender...');
    const info = await transporter.sendMail({
      from: `"CureVirtual Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'SMTP Diagnostic Test',
      text: 'If you are reading this, your Gmail SMTP is working perfectly with the new robust settings.',
    });
    console.log('✅ Test email sent! MessageID:', info.messageId);
    console.log('Check your Gmail "Sent" folder or inbox.');
  } catch (error) {
    console.error('❌ Diagnostic Failed:');
    console.error(error.message);
    if (error.message.includes('Username and Password not accepted')) {
      console.error('HINT: Your Gmail App Password might be incorrect or revoked.');
    }
  }
}

runTest();
