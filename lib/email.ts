import { Resend } from 'resend';
import { render } from '@react-email/render'; // To convert React Email component to HTML
import { VerificationEmail } from '@/emails/VerificationEmail'; // Adjust the import path as necessary

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailProps {
  to: string;
  token: string;
  firstName: string;
}

export async function sendVerificationEmail({ to, token, firstName }: SendVerificationEmailProps) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-email?token=${token}`;

    // Render your React Email component to HTML
    const emailHtml = await render(
      VerificationEmail({
        firstName,
        verificationUrl,
        tokenExpiresInHours: 24, // Pass the expiration info if you want to display it
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

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!, // e.g., 'OSCA <no-reply@osca.com>'
      to: [to], // Pass 'to' as an array
      subject: 'Verify Your Email - OSCA Account',
      html: emailHtml,
      text: emailText, // Include the plain text version
    });

    if (error) {
      console.error('❌ Failed to send verification email with Resend:', error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Email send failed: No data returned from Resend.');
    }

    console.log('📩 Email sent successfully with Resend:', data);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Unexpected error during email sending:', error);
    throw new Error(`Email send failed: ${(error as Error).message}`);
  }
}