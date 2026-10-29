const { validationResult } = require('express-validator');
const { transporter, CONTACT_RECEIVER } = require('../config/emailConfig');
const { pool } = require('../config/db');

/**
 * Helper to escape HTML characters in email templates
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Controller to handle visitor contact form submissions
 * POST /api/contact
 * Validates data, sends email directly to Gmail via Nodemailer,
 * and saves a copy to MySQL database if available.
 */
async function submitContactMessage(req, res, next) {
  try {
    // 1. Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please verify your inputs.',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { name, email, message, subject } = req.body;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();
    const trimmedSubject = subject && typeof subject === 'string' ? subject.trim() : '';

    const submissionTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    const fullMessage = trimmedSubject
      ? `Subject: ${trimmedSubject}\n\n${trimmedMessage}`
      : trimmedMessage;

    // 2. Format plain text email body as specified
    const plainTextBody = [
      `Visitor Name: ${trimmedName}`,
      `Visitor Email: ${trimmedEmail}`,
      '',
      'Message:',
      trimmedMessage,
      '',
      `Submitted At: ${submissionTime}`
    ].join('\n');

    // 3. Format HTML version for rich Gmail display
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <h2 style="margin-top: 0; color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 12px;">New Portfolio Contact Message</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 130px; color: #475569;">Visitor Name:</td>
            <td style="padding: 6px 0;">${escapeHtml(trimmedName)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Visitor Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${trimmedEmail}" style="color: #4f46e5; text-decoration: underline;">${escapeHtml(trimmedEmail)}</a></td>
          </tr>
          ${trimmedSubject ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Subject:</td><td style="padding: 6px 0;">${escapeHtml(trimmedSubject)}</td></tr>` : ''}
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Submitted At:</td>
            <td style="padding: 6px 0; color: #64748b;">${submissionTime}</td>
          </tr>
        </table>
        <div style="margin-top: 16px;">
          <p style="font-weight: bold; margin-bottom: 8px; color: #475569;">Message:</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px 16px; border-radius: 4px; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${escapeHtml(trimmedMessage)}</div>
        </div>
        <p style="margin-top: 24px; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
          💡 <em>Reply directly to this email to respond to ${escapeHtml(trimmedName)} (${escapeHtml(trimmedEmail)}).</em>
        </p>
      </div>
    `;

    const recipient = process.env.CONTACT_RECEIVER || CONTACT_RECEIVER;
    const sender = process.env.EMAIL_USER;

    // Validate that sender email is configured (not missing / placeholder / malformed)
    if (!sender || sender.includes('your_gmail') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) {
      console.error('[Email Dispatch Error] EMAIL_USER is not configured (or still a placeholder) in backend/.env.');
      console.error('   Current EMAIL_USER value:', sender || '(empty)');
      return res.status(500).json({
        success: false,
        message: 'Unable to send your message. Please try again later.'
      });
    }

    // Also guard against a missing / placeholder App Password before attempting SMTP
    const appPassword = (process.env.EMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!appPassword || appPassword.includes('your_16')) {
      console.error('[Email Dispatch Error] EMAIL_APP_PASSWORD is not configured (or still a placeholder) in backend/.env.');
      return res.status(500).json({
        success: false,
        message: 'Unable to send your message. Please try again later.'
      });
    }

    // 4. Send email via Nodemailer
    const mailOptions = {
      from: `"Portfolio Contact Form" <${sender}>`,
      to: recipient,
      replyTo: trimmedEmail, // Allows Manasa to click 'Reply' directly to the visitor
      subject: trimmedSubject ? `New Portfolio Contact Message: ${trimmedSubject}` : 'New Portfolio Contact Message',
      text: plainTextBody,
      html: htmlBody
    };

    console.log(`[Email Dispatch] Attempting to send email from "${sender}" to "${recipient}" (visitor: ${trimmedEmail})...`);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Sent] Message from "${trimmedName}" (${trimmedEmail}) delivered to "${recipient}". MessageId: ${info.messageId}`);
      if (info && info.accepted) {
        console.log(`[Email Sent] Accepted recipients: ${Array.isArray(info.accepted) ? info.accepted.join(', ') : info.accepted}`);
      }
    } catch (mailError) {
      console.error('[Nodemailer Error] Failed to send email via SMTP:', mailError && mailError.message);
      // Log the full error object so the exact failure can be pinpointed in the terminal
      console.error('[Nodemailer Error] Full error details:', {
        name: mailError && mailError.name,
        code: mailError && mailError.code,
        responseCode: mailError && mailError.responseCode,
        response: mailError && mailError.response,
        command: mailError && mailError.command,
        errno: mailError && mailError.errno,
        syscall: mailError && mailError.syscall,
        stack: mailError && mailError.stack
      });
      // Actionable hints based on common SMTP/Gmail failures
      if (mailError && (mailError.code === 'EAUTH' || mailError.responseCode === 535)) {
        console.error('   Hint: Gmail authentication failed. Use a 16-char App Password (not your normal password),');
        console.error('   enable 2-Step Verification, remove spaces, and ensure EMAIL_USER matches the Google account.');
      } else if (mailError && (mailError.code === 'ECONNECTION' || mailError.code === 'ETIMEDOUT' || mailError.code === 'ESOCKET' || mailError.code === 'EPIPE')) {
        console.error('   Hint: Could not reach smtp.gmail.com:465. Check network/firewall/antivirus,');
        console.error('   or switch to port 587 with secure:false (STARTTLS).');
      } else if (mailError && mailError.code === 'ENOTFOUND') {
        console.error('   Hint: DNS lookup failed for smtp.gmail.com. Check your internet connection.');
      } else if (mailError && mailError.code === 'EMESSAGE') {
        console.error('   Hint: Message rejected by server. Check "from"/"to" addresses and message size.');
      }
      return res.status(500).json({
        success: false,
        message: 'Unable to send your message. Please try again later.'
      });
    }

    // 5. Optionally also persist in MySQL database if available
    try {
      if (pool) {
        await pool.execute(
          'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
          [trimmedName, trimmedEmail, fullMessage]
        );
        console.log('[Database] Contact message logged to MySQL table.');
      }
    } catch (dbError) {
      // Log DB error without failing the email response since email was already sent
      console.warn('[Database Notice] Could not log message to MySQL:', dbError.message);
    }

    // 6. Return standard success response
    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative controller to retrieve all contact messages from MySQL
 * GET /api/contact (Protected)
 */
async function getContactMessages(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const [countResult] = await pool.query('SELECT COUNT(*) AS total FROM contact_messages');
    const total = countResult[0].total;

    const [rows] = await pool.query(
      'SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Health check controller
 * GET /api/health
 */
async function getHealthStatus(req, res) {
  let dbStatus = 'disconnected';
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'unreachable';
  }

  const emailConfigured = Boolean(
    process.env.EMAIL_USER &&
    !process.env.EMAIL_USER.includes('your_gmail') &&
    process.env.EMAIL_APP_PASSWORD &&
    !process.env.EMAIL_APP_PASSWORD.includes('your_16')
  );

  return res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'portfolio-backend-api',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    emailService: {
      recipient: process.env.CONTACT_RECEIVER || CONTACT_RECEIVER,
      status: emailConfigured ? 'configured' : 'placeholder_credentials'
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  submitContactMessage,
  getContactMessages,
  getHealthStatus
};
