// src/app/api/seniors/handlers/get-archived.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils';
import { seniorService } from '../services/senior.service';

export async function getArchivedSeniorsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const archivedSeniors = await seniorService.getArchivedSeniors(searchParams);
    return NextResponse.json(archivedSeniors);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch archived seniors.');
  }
}