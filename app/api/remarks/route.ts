// app/api/remarks/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/remarks
 * Fetches all remarks ordered by their order field
 */
export async function GET() {
  try {
    const remarks = await prisma.remarks.findMany({
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        name: true,
        order: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: remarks 
    });
  } catch (error) {
    console.error('Error fetching remarks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch remarks' 
      },
      { status: 500 }
    );
  }
}