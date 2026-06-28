require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/"/g, '').replace(/ /g, '')
    }
  });

  console.log(`Testing SMTP for user: ${process.env.EMAIL_USER}`);
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful! Credentials are correct.');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
  }
}

testSMTP();
