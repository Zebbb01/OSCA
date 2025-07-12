// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token || typeof token !== 'string') {
    return NextResponse.json(
      { message: 'Invalid verification token.' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Verification token not found or already used.' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified.' },
        { status: 400 }
      );
    }

    if (user.tokenExpires && user.tokenExpires < new Date()) {
      return NextResponse.json(
        { message: 'Verification token has expired. Please sign up again or request a new verification email.' },
        { status: 400 }
      );
    }

    // Verify the user's email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        tokenExpires: null,
      },
    });

    // Redirect to a success page
    return NextResponse.redirect(new URL('/auth/verification-success', req.url));

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred during email verification.' },
      { status: 500 }
    );
  }
}