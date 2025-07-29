// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token || typeof token !== 'string') {
    console.log('❌ Invalid or missing token');
    return NextResponse.redirect(
      new URL('/auth/verification-error?message=invalid_token', req.url)
    );
  }

  try {
    console.log('🔍 Looking for user with token:', token);
    
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      console.log('❌ User not found with token:', token);
      return NextResponse.redirect(
        new URL('/auth/verification-error?message=token_not_found', req.url)
      );
    }

    if (user.emailVerified) {
      console.log('⚠️ Email already verified for user:', user.email);
      return NextResponse.redirect(
        new URL('/auth/verification-error?message=already_verified', req.url)
      );
    }

    if (user.tokenExpires && user.tokenExpires < new Date()) {
      console.log('⏰ Token expired for user:', user.email);
      return NextResponse.redirect(
        new URL('/auth/verification-error?message=token_expired', req.url)
      );
    }

    console.log('✅ Verifying email for user:', user.email);
    
    // Verify the user's email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        tokenExpires: null,
      },
    });

    console.log('🎉 Email verification successful for:', user.email);
    
    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/verification-success', req.url)
    );

  } catch (error) {
    console.error('❌ Email verification error:', error);
    return NextResponse.redirect(
      new URL('/auth/verification-error?message=unexpected_error', req.url)
    );
  }
}