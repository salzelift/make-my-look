const { Resend } = require('resend');

// Validate Resend configuration on module load
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  WARNING: RESEND_API_KEY is not set in environment variables');
}

if (!process.env.RESEND_FROM_EMAIL) {
  console.warn('⚠️  WARNING: RESEND_FROM_EMAIL is not set in environment variables');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendOTPEmail = async (email, otp) => {
  if (!resend) {
    throw new Error('Resend API is not configured. Please set RESEND_API_KEY in environment variables.');
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('Resend FROM email is not configured. Please set RESEND_FROM_EMAIL in environment variables.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #000000;">
          <h2 style="color: #000000; border-bottom: 2px solid #000000; padding-bottom: 10px;">Password Reset Request</h2>
          <p style="color: #000000; font-size: 16px;">You have requested to reset your password.</p>
          <p style="color: #000000; font-size: 16px;">Your OTP code is:</p>
          <div style="background-color: #f5f5f5; border: 2px solid #000000; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #000000; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #000000; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #000000; font-size: 14px;">If you did not request this password reset, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
};

