const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend directory regardless of the current working directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const EMAIL_USER = (process.env.EMAIL_USER || '').trim();
// Google App Passwords are often copied with spaces; strip them to avoid auth failures
const EMAIL_APP_PASSWORD = (process.env.EMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER || 'reddymanasa0271@gmail.com';

/**
 * Configure Nodemailer transport using Gmail SMTP (Port 465 SSL/TLS)
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASSWORD
  },
  // Sensible timeout settings
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

/**
 * Verify transporter connectivity and configuration on startup safely.
 */
async function verifyEmailConfig() {
  // Check if environment variables are set
  if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
    console.warn('⚠️  [Email Config] EMAIL_USER or EMAIL_APP_PASSWORD is not set in .env.');
    console.warn('   To enable live email delivery to ' + CONTACT_RECEIVER + ',');
    console.warn('   configure your Gmail address and 16-character Google App Password in backend/.env.');
    return false;
  }

  if (EMAIL_USER.includes('your_gmail') || EMAIL_APP_PASSWORD.includes('your_16')) {
    console.warn('⚠️  [Email Config] EMAIL_USER or EMAIL_APP_PASSWORD contains placeholder values in .env.');
    console.warn('   Update backend/.env with your actual Gmail account and App Password to activate email sending.');
    return false;
  }

  // Basic format sanity check for the sender address
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USER)) {
    console.warn('⚠️  [Email Config] EMAIL_USER does not look like a valid email address:', EMAIL_USER);
    return false;
  }

  try {
    await transporter.verify();
    console.log(`📧 [Email Config] Gmail SMTP connection verified. Emails will be delivered to: "${CONTACT_RECEIVER}"`);
    return true;
  } catch (error) {
    console.error('⚠️  [Email Config Error] Gmail SMTP verification failed:', error.message);
    // Log full error details to help pinpoint the exact failure in the terminal
    console.error('   Full error details:', {
      name: error.name,
      code: error.code,
      responseCode: error.responseCode,
      response: error.response,
      command: error.command,
      errno: error.errno,
      syscall: error.syscall
    });
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('   Hint: Authentication failed. Please ensure you are using a 16-character Google App Password');
      console.error('   (not your standard Gmail login password) with 2-Step Verification enabled.');
      console.error('   Remove any spaces from the App Password and ensure EMAIL_USER matches the Google account.');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      console.error('   Hint: Could not reach smtp.gmail.com:465. Check your network/firewall/antivirus,');
      console.error('   or switch to port 587 with secure:false (STARTTLS).');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   Hint: DNS lookup failed for smtp.gmail.com. Check your internet connection.');
    }
    return false;
  }
}

module.exports = {
  transporter,
  verifyEmailConfig,
  CONTACT_RECEIVER
};
