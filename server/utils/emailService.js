import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// HTML Template - Verification Email
const getVerificationEmailTemplate = (userName, verificationUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0072CE 0%, #171C8F 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0;">✉️ Verify Your Email</h1>
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0;">Welcome to DEI Cafe</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for registering with DEI Cafe! Please verify your email address to activate your account.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #0072CE 0%, #171C8F 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Or copy and paste this link: <br>
                <a href="${verificationUrl}" style="color: #0072CE; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                This link will expire in 24 hours.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #999; font-size: 12px; margin: 0;">© 2025 DEI Cafe - Forvis Mazars</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// HTML Template - Password Reset
const getPasswordResetEmailTemplate = (userName, resetUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0;">🔐 Reset Password</h1>
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0;">DEI Cafe</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Or copy and paste this link: <br>
                <a href="${resetUrl}" style="color: #dc3545; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #999; font-size: 12px; margin: 0;">© 2025 DEI Cafe - Forvis Mazars</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// HTML Template - Welcome Email
const getWelcomeEmailTemplate = (userName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to DEI Cafe</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0;">🎉 Welcome!</h1>
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0;">You're all set</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Welcome to DEI Cafe! Your email has been verified and your account is now active.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Explore Platform</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #999; font-size: 12px; margin: 0;">© 2025 DEI Cafe - Forvis Mazars</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Send Verification Email
export const sendVerificationEmail = async (email, verificationToken, userName = 'User') => {
  console.log(`📧 Sending verification email to: ${email}`);
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  
  try {
    const info = await transporter.sendMail({
      from: {
        name: 'DEI Cafe',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '✉️ Verify Your Email - DEI Cafe',
      html: getVerificationEmailTemplate(userName, verificationUrl)
    });
    
    console.log('✅ Verification email sent! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    throw error;
  }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  console.log(`📧 Sending password reset email to: ${email}`);
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  try {
    const info = await transporter.sendMail({
      from: {
        name: 'DEI Cafe',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Reset Your Password - DEI Cafe',
      html: getPasswordResetEmailTemplate(userName, resetUrl)
    });
    
    console.log('✅ Password reset email sent! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    throw error;
  }
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, userName = 'User') => {
  console.log(`📧 Sending welcome email to: ${email}`);
  
  try {
    const info = await transporter.sendMail({
      from: {
        name: 'DEI Cafe',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🎉 Welcome to DEI Cafe!',
      html: getWelcomeEmailTemplate(userName)
    });
    
    console.log('✅ Welcome email sent! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    return { success: false, error: error.message };
  }
};
