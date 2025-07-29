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

    // Apply the 3-day interval here for the releasedAt date
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3); // <-- THIS IS WHERE YOU APPLY THE 3-DAY INTERVAL

    const updatedSenior = await prisma.senior.update({
      where: { id: seniorId },
      data: {
        releasedAt: releaseDate, // This will now store the date 3 days from the current time
      },
    });

    // For the message, you might want to clarify it's an "effective" release date or "available from"
    return NextResponse.json({
      message: `Senior will be effectively released on ${releaseDate.toDateString()}.`,
      senior: updatedSenior, // This 'updatedSenior' will contain the future `releasedAt`
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