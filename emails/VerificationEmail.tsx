// emails\VerificationEmail.tsx

import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  firstName: string;
  verificationUrl: string;
  tokenExpiresInHours?: number;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://xpvs9c65-3000.asse.devtunnels.ms/'; // Fallback for local development

export const VerificationEmail = ({
  firstName,
  verificationUrl,
  tokenExpiresInHours = 24,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email to complete your OSCA registration</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Optional: Add a logo with similar styling to VerifyEmailPage's icons */}

        {/* <Section style={logoContainer}>
            <Img
                src={`${baseUrl}/img/cthall-logo-removedBG.png`} // Make sure you have a logo in public/static
                width="80"
                height="80"
                alt="City Hall Logo"
                style={logo}
            />
        </Section> */}


        <Text style={heading}>Account Verification</Text>
        <Text style={paragraph}>Hello {firstName},</Text>
        <Text style={paragraph}>
          Thank you for signing up for OSCA! To complete your registration and activate your account,
          please click the button below to verify your email address.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verificationUrl}>
            Verify Email Address
          </Button>
        </Section>
        {/* <Text style={paragraph}>
          If the button doesn't work, you can also copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>
          <Link href={verificationUrl} style={link}>
            {verificationUrl}
          </Link>
        </Text> */}
        <Hr style={hr} />
        <Text style={footerText}>
          This verification link will expire in {tokenExpiresInHours} hours.
        </Text>
        <Text style={footerText}>
          If you didn't create an account with OSCA, please ignore this email.
        </Text>
        <Text style={footerText}>
          &copy; {new Date().getFullYear()} OSCA. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;

const main = {
  backgroundColor: '#f8fafc', // from gray-50 to gray-100, so a light gray/off-white
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', // More web-safe font stack
  color: '#334155', // dark gray for main text
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '32px', // p-8
  borderRadius: '24px', // rounded-3xl
  border: '1px solid #e2e8f0', // border-white/20 becomes border-gray-200
  maxWidth: '576px', // max-w-lg (576px in Tailwind default)
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', // shadow-2xl
};

const logoContainer = {
  textAlign: 'center' as 'center',
  marginBottom: '24px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
  borderRadius: '9999px', // rounded-full
  backgroundColor: '#d1fae5', // emerald-200 for background feel
};

const heading = {
  fontSize: '28px', // text-3xl
  fontWeight: '700', // font-bold
  textAlign: 'center' as 'center',
  color: '#059669', // A strong emerald-600 color
  marginBottom: '20px',
  // Simulate bg-clip-text and text-transparent with a solid color for email compatibility
};

const paragraph = {
  fontSize: '16px', // text-lg
  lineHeight: '1.6',
  color: '#475569', // gray-600
  marginBottom: '15px',
};

const linkText = {
  fontSize: '14px', // text-sm
  wordBreak: 'break-all' as 'break-all',
  marginBottom: '20px',
  color: '#64748b', // gray-500
};

const link = {
  color: '#059669', // emerald-600
  textDecoration: 'underline',
};

const buttonContainer = {
  textAlign: 'center' as 'center',
  margin: '30px 0',
};

const button = {
  backgroundColor: '#059669', // from-emerald-600 to-emerald-700, picked a middle ground
  color: '#fff',
  padding: '16px 32px', // py-4 px-8
  borderRadius: '16px', // rounded-2xl
  fontWeight: '600', // font-semibold
  fontSize: '18px', // text-lg
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', // shadow-lg
  // Hover effects (shadow, scale, opacity) are not reliably supported in emails
  // Focus ring not applicable
  // Overflow hidden for gradient is not directly translatable
};

const hr = {
  borderColor: '#e2e8f0', // gray-200
  margin: '28px 0', // mt-8 pt-6 (border-t)
};

const footerText = {
  fontSize: '12px', // text-sm
  color: '#64748b', // gray-500
  textAlign: 'center' as 'center',
  lineHeight: '1.5',
  marginTop: '10px',
};