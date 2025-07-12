// app/api/seniors/release/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    const { seniorId } = await request.json();

    if (!seniorId) {
      return NextResponse.json({ message: 'Senior ID is required.' }, { status: 400 });
    }

    const senior = await prisma.senior.findUnique({
      where: { id: seniorId },
    });

    if (!senior) {
      return NextResponse.json({ message: 'Senior not found.' }, { status: 404 });
    }

    if (senior.releasedAt) {
      return NextResponse.json({ message: 'Senior is already released.' }, { status: 409 });
    }

    const updatedSenior = await prisma.senior.update({
      where: { id: seniorId },
      data: {
        releasedAt: new Date(), // Set the current date as the release date
      },
    });

    return NextResponse.json({
      message: 'Senior released successfully.',
      senior: updatedSenior,
    }, { status: 200 });

  } catch (error) {
    console.error('Error releasing senior:', error);
    return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const releasedSeniors = await prisma.senior.findMany({
      where: {
        releasedAt: {
          not: null, // Filter for seniors where releasedAt is not null
        },
      },
      orderBy: {
        releasedAt: 'desc', // Order by most recently released
      },
    });

    return NextResponse.json(releasedSeniors, { status: 200 });
  } catch (error) {
    console.error('Error fetching released seniors:', error);
    return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}