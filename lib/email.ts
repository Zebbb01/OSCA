// lib/email.ts
import nodemailer from 'nodemailer';

interface SendVerificationEmailProps {
  to: string;
  token: string;
  username: string;
}

export async function sendVerificationEmail({ to, token, username }: SendVerificationEmailProps) {
  try {
    console.log('Using Mailtrap credentials...');
    console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST);
    console.log('EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.verify();
    console.log('✅ Mailtrap SMTP connection verified');

    const verificationUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verify Your Email - OSCA Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin-bottom: 10px;">Welcome to OSCA!</h1>
            <p style="color: #6b7280; font-size: 16px;">Please verify your email address to complete your registration</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #374151; margin-bottom: 15px;">Hello ${username},</h2>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up for OSCA! To complete your registration and activate your account, 
              please click the button below to verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="color: #10b981; word-break: break-all; font-size: 14px;">
              ${verificationUrl}
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with OSCA, please ignore this email.</p>
          </div>
        </div>
      `,
      text: `Welcome to OSCA!\n\nHello ${username},\n\nVerify your email here: ${verificationUrl}\n\nThis link expires in 24 hours.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📩 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error(`Email send failed: ${(error as Error).message}`);
  }
}
