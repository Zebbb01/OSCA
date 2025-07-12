// app\api\seniors\archived\route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const queryOptions: any = {
      include: {
        remarks: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        NOT: { deletedAt: null }, // Fetch records where deletedAt is NOT null
      },
    };

    if (searchParams.has('name')) {
      const nameSearch = searchParams.get('name');
      queryOptions.where.OR = [
        { firstname: { contains: nameSearch, mode: 'insensitive' } },
        { middlename: { contains: nameSearch, mode: 'insensitive' } },
        { lastname: { contains: nameSearch, mode: 'insensitive' } },
      ];
    }

    const archivedSeniors = await prisma.senior.findMany(queryOptions);
    return NextResponse.json(archivedSeniors);
  } catch (error) {
    console.error('GET /api/seniors/archived error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch archived seniors', error: String(error) },
      { status: 500 }
    );
  }
}