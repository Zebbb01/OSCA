// app/api/transactions/route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating transaction creation
const createTransactionSchema = z.object({
  date: z.string(),
  benefits: z.string(),
  description: z.string(),
  amount: z.number().positive(),
  type: z.enum(['released', 'pending']),
  category: z.string(),
  seniorName: z.string().optional(),
  barangay: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const parsed = createTransactionSchema.parse(body);

    // Create the transaction in the database
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(parsed.date),
        benefits: parsed.benefits,
        description: parsed.description,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        seniorName: parsed.seniorName || null,
        barangay: parsed.barangay || null,
      },
    });

    // Return the transaction directly (not nested in data property)
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('[CREATE_TRANSACTION_ERROR]', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          msg: 'Validation error', 
          errors: error.errors,
          code: 400 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        msg: error.message || 'Failed to create transaction', 
        code: 500 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Optional filters
    const type = searchParams.get('type');
    const benefits = searchParams.get('benefits');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }

    if (benefits) {
      whereClause.benefits = {
        contains: benefits,
        mode: 'insensitive',
      };
    }

    if (category) {
      whereClause.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error: any) {
    console.error('[GET_TRANSACTIONS_ERROR]', error);
    return NextResponse.json(
      { 
        msg: error.message || 'Failed to fetch transactions', 
        code: 500 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json(
        { msg: 'Transaction ID is required', code: 400 }, 
        { status: 400 }
      );
    }

    await prisma.transaction.delete({
      where: {
        id: parseInt(transactionId),
      },
    });

    return NextResponse.json(
      { msg: 'Transaction deleted successfully', code: 200 }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[DELETE_TRANSACTION_ERROR]', error);
    return NextResponse.json(
      { 
        msg: error.message || 'Failed to delete transaction', 
        code: 500 
      }, 
      { status: 500 }
    );
  }
}