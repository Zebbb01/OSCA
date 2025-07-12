// src/app/api/seniors/handlers/get.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils';
import { seniorService } from '../services/senior.service';

export async function getSeniorsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const seniors = await seniorService.getSeniors(searchParams);
    return NextResponse.json(seniors);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch seniors.');
  }
}