// lib/email-nodemailer.ts
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { VerificationEmail } from '@/emails/VerificationEmail';

interface SendVerificationEmailProps {
  to: string;
  token: string;
  firstName: string;
}

// Create Gmail transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export async function sendVerificationEmail({ to, token, firstName }: SendVerificationEmailProps) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-email?token=${token}`;

    // Render your React Email component to HTML
    const emailHtml = await render(
      VerificationEmail({
        firstName,
        verificationUrl,
        tokenExpiresInHours: 24,
      })
    );

    // Render a plain text version for email clients that don't display HTML
    const emailText = await render(
      VerificationEmail({
        firstName,
        verificationUrl,
        tokenExpiresInHours: 24,
      }),
      { plainText: true }
    );

    // Create transporter
    const transporter = createGmailTransporter();

    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified successfully');

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // sender address
      to: to, // list of receivers
      subject: 'Verify Your Email - OSCA Account',
      text: emailText, // plain text body
      html: emailHtml, // html body
    });

    console.log('📩 Email sent successfully with Gmail:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Failed to send verification email with Gmail:', error);
    throw new Error(`Email send failed: ${(error as Error).message}`);
  }
}