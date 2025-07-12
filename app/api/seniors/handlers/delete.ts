// src/app/api/seniors/handlers/delete.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils';
import { seniorService } from '../services/senior.service';

export async function deleteSeniorsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const action = searchParams.get('action');

    if (!idParam || isNaN(parseInt(idParam, 10))) {
      return handleApiError(new Error('Invalid Senior ID.'), 'Senior ID is required for deletion.', 400);
    }

    const seniorId = parseInt(idParam, 10);

    if (action === 'permanent') {
      await seniorService.permanentDeleteSenior(seniorId);
      return NextResponse.json({ success: true, message: `Senior with ID ${seniorId} permanently deleted.` }, { status: 200 });
    } else {
      await seniorService.softDeleteSenior(seniorId);
      return NextResponse.json({ success: true, message: `Senior with ID ${seniorId} soft-deleted.` }, { status: 200 });
    }
  } catch (error: any) {
    if (error.code === 'P2025') {
      return handleApiError(error, 'Senior record not found for deletion.', 404);
    }
    return handleApiError(error, 'Failed to delete senior.');
  }
}