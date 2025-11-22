// app/api/fund-history/route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const date = formData.get('date') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const from = formData.get('from') as string;
    const description = formData.get('description') as string;
    const availableBalance = parseFloat(formData.get('availableBalance') as string); // Current available balance
    const receiptFile = formData.get('receipt') as File | null;

    // Validate required fields
    if (!date || !amount || !from) {
      return NextResponse.json(
        { msg: 'Date, amount, and source are required', code: 400 },
        { status: 400 }
      );
    }

    let receiptPath: string | null = null;
    let receiptUrl: string | null = null;

    // Handle file upload if present
    if (receiptFile && receiptFile instanceof File) {
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${receiptFile.name.replace(/\s/g, '-')}`;
      
      // Ensure upload directory exists
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'fund-receipts');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      receiptPath = `/uploads/fund-receipts/${filename}`;
      receiptUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${receiptPath}`;
    }

    // Calculate new balance: Available Balance + Amount Added
    const newAvailableBalance = availableBalance + amount;

    // Get current fund data to calculate total fund balance
    let fund = await prisma.governmentFund.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total released (to get total fund balance)
    const allTransactions = await prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE type = 'released'
    `;
    const totalReleased = allTransactions[0]?.total || 0;

    // Current total fund balance = available balance + total released
    const currentTotalFundBalance = fund?.currentBalance || 0;
    
    // New total fund balance = current total + amount added
    const newTotalFundBalance = currentTotalFundBalance + amount;

    // Create fund history record
    const fundHistory = await prisma.fundHistory.create({
      data: {
        date: new Date(date),
        amount: amount,
        from: from,
        description: description || null,
        receiptPath: receiptPath,
        receiptUrl: receiptUrl,
        previousBalance: availableBalance, // Store available balance before addition
        newBalance: newAvailableBalance,   // Store available balance after addition
      },
    });

    // Update government fund balance (stores total fund balance)
    if (!fund) {
      fund = await prisma.governmentFund.create({
        data: { currentBalance: newTotalFundBalance },
      });
    } else {
      fund = await prisma.governmentFund.update({
        where: { id: fund.id },
        data: { currentBalance: newTotalFundBalance },
      });
    }

    return NextResponse.json(fundHistory, { status: 201 });
  } catch (error: any) {
    console.error('[CREATE_FUND_HISTORY_ERROR]', error);
    return NextResponse.json(
      { 
        msg: error.message || 'Failed to add fund', 
        code: 500 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = {};

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    const fundHistory = await prisma.fundHistory.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(fundHistory, { status: 200 });
  } catch (error: any) {
    console.error('[GET_FUND_HISTORY_ERROR]', error);
    return NextResponse.json(
      { 
        msg: error.message || 'Failed to fetch fund history', 
        code: 500 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const historyId = url.searchParams.get('history_id');

    if (!historyId) {
      return NextResponse.json(
        { msg: 'History ID is required', code: 400 }, 
        { status: 400 }
      );
    }

    // Get the fund history record
    const fundHistory = await prisma.fundHistory.findUnique({
      where: { id: parseInt(historyId) },
    });

    if (!fundHistory) {
      return NextResponse.json(
        { msg: 'Fund history not found', code: 404 },
        { status: 404 }
      );
    }

    // Get current fund balance and subtract the deleted amount
    const currentFund = await prisma.governmentFund.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (currentFund) {
      const newTotalFundBalance = currentFund.currentBalance - fundHistory.amount;
      await prisma.governmentFund.update({
        where: { id: currentFund.id },
        data: { currentBalance: newTotalFundBalance },
      });
    }

    // Delete the fund history record
    await prisma.fundHistory.delete({
      where: { id: parseInt(historyId) },
    });

    return NextResponse.json(
      { msg: 'Fund history deleted successfully', code: 200 }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[DELETE_FUND_HISTORY_ERROR]', error);
    return NextResponse.json(
      { 
        msg: error.message || 'Failed to delete fund history', 
        code: 500 
      }, 
      { status: 500 }
    );
  }
}