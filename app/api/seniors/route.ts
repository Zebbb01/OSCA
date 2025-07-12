// src/app/api/seniors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils'; // Re-export if you prefer, or just import here
import { getSeniorsHandler } from './handlers/get';
import { getArchivedSeniorsHandler } from './handlers/get-archived';
import { postSeniorsHandler } from './handlers/post';
import { putSeniorsHandler } from './handlers/put';
import { deleteSeniorsHandler } from './handlers/delete';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'archived') {
    return getArchivedSeniorsHandler(request);
  } else {
    return getSeniorsHandler(request);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return postSeniorsHandler(request);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  return putSeniorsHandler(request);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return deleteSeniorsHandler(request);
}

// Keeping PATCH if you intend to have distinct PATCH operations,
// otherwise the 'restore' action can solely live in PUT as implemented above.
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  // If you decide to keep PATCH for restore, you'd have a separate handler for it.
  // For now, if PUT handles restore, this can be removed or left as a placeholder for future PATCH actions.
  // Example if you still want a dedicated PATCH restore handler:
  // const { searchParams } = new URL(request.url);
  // const idParam = searchParams.get('id');
  // if (!idParam || isNaN(parseInt(idParam, 10))) {
  //   return handleApiError(new Error('Invalid Senior ID for PATCH restore.'), 'Senior ID is required for restore action.', 400);
  // }
  // try {
  //   const restoredSenior = await seniorService.restoreSenior(parseInt(idParam, 10));
  //   return NextResponse.json(
  //     { success: true, message: `Senior with ID ${idParam} restored successfully.`, data: restoredSenior },
  //     { status: 200 }
  //   );
  // } catch (error: any) {
  //   return handleApiError(error, 'Failed to restore senior via PATCH.');
  // }

  // If PUT handles restore, you might remove this PATCH export, or adapt it for other uses.
  return handleApiError(new Error('Method Not Allowed'), 'PATCH method is not supported for this endpoint or action.', 405);
}