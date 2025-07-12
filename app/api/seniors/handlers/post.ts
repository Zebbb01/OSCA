// src/app/api/seniors/handlers/post.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils';
import { seniorService } from '../services/senior.service';

export async function postSeniorsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const seniorIdToUpdate = formData.get('id') as string | null;

    if (seniorIdToUpdate) {
      // Logic for updating existing senior with new documents for requirements
      const result = await seniorService.updateSeniorDocuments(formData);
      return NextResponse.json({ success: true, ...result }, { status: 200 });
    } else {
      // Logic for creating a new senior
      const senior = await seniorService.createSenior(formData);
      return NextResponse.json(
        { success: true, message: 'Senior Registered Successfully', senior: senior },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Detailed POST API Error:', error);
    return handleApiError(error, 'Failed to process senior registration/update.');
  }
}