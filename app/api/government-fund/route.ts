// app/api/government-fund/route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateBalanceSchema = z.object({
  currentBalance: z.number().positive(),
});

export async function GET() {
  try {
    let fund = await prisma.governmentFund.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // Create initial record if none exists
    if (!fund) {
      fund = await prisma.governmentFund.create({
        data: { currentBalance: 0 },
      });
    }

    return NextResponse.json(fund, { status: 200 });
  } catch (error: any) {
    console.error('[GET_FUND_ERROR]', error);
    return NextResponse.json(
      { msg: error.message || 'Failed to fetch fund balance', code: 500 },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateBalanceSchema.parse(body);

    let fund = await prisma.governmentFund.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!fund) {
      fund = await prisma.governmentFund.create({
        data: { currentBalance: parsed.currentBalance },
      });
    } else {
      fund = await prisma.governmentFund.update({
        where: { id: fund.id },
        data: { currentBalance: parsed.currentBalance },
      });
    }

    return NextResponse.json(fund, { status: 200 });
  } catch (error: any) {
    console.error('[UPDATE_FUND_ERROR]', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { msg: 'Validation error', errors: error.errors, code: 400 },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { msg: error.message || 'Failed to update fund balance', code: 500 },
      { status: 500 }
    );
  }
}