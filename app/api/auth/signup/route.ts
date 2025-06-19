// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/schema/auth/signup.schema';
import prisma from '@/prisma/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    const {
      firstName,
      lastName,
      middleName,
      contactNo,
      username,
      bday,
      email,
      password,
    } = validatedData;

    // Check if user with email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: 'Email address already registered.' },
          { status: 409 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: 'Username already taken.' },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Convert bday to ISO 8601 format for Prisma
    const birthDate = new Date(bday);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        middleName,
        contactNo,
        username,
        bday: birthDate,
        email,
        password: hashedPassword,
        verificationToken,
        tokenExpires,
        emailVerified: null,
        role: 'USER',
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        to: newUser.email,
        token: verificationToken,
        username: newUser.username,
      });
      console.log('Verification email sent successfully to:', newUser.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Even if email fails, we still created the user successfully
      // You might want to implement a retry mechanism or manual email sending
    }

    return NextResponse.json(
      { message: 'Account created successfully! Please check your email to verify your account.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'An unexpected error occurred during signup.' },
      { status: 500 }
    );
  }
}