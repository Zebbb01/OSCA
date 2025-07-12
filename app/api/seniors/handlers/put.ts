// src/app/api/seniors/handlers/put.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils';
import { seniorService } from '../services/senior.service';

export async function putSeniorsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    let seniorId: number;
    let updateData: any;

    if (action === 'restore') {
      const idParam = searchParams.get('id');
      if (!idParam || isNaN(parseInt(idParam, 10))) {
        return handleApiError(new Error('Invalid Senior ID for restore.'), 'Senior ID is required for restore action.', 400);
      }
      seniorId = parseInt(idParam, 10);
      const restoredSenior = await seniorService.restoreSenior(seniorId);
      return NextResponse.json({ success: true, message: `Senior record restored successfully.`, data: restoredSenior });
    } else {
      const body = await request.json();

      if (body.id === undefined || isNaN(parseInt(body.id))) {
        return handleApiError(new Error('Invalid Senior ID for update.'), 'Senior ID is required in the request body for update.', 400);
      }
      seniorId = parseInt(body.id, 10);

      updateData = {
        firstname: body.firstname,
        middlename: body.middlename,
        lastname: body.lastname,
        age: body.age,
        birthdate: body.birthdate,
        gender: body.gender,
        email: body.email,
        contact_no: body.contact_no,
        emergency_no: body.emergency_no,
        barangay: body.barangay,
        purok: body.purok,
        pwd: body.pwd,
        contact_person: body.contact_person,
        remarks_id: body.remarks_id, // If you want to allow updating remarks via PUT
      };

      const updatedSenior = await seniorService.updateSenior(seniorId, updateData);
      return NextResponse.json({ success: true, message: 'Senior record updated successfully.', data: updatedSenior });
    }
  } catch (error: any) {
    if (error.code === 'P2025') {
      return handleApiError(error, 'Senior record not found for the provided ID.', 404);
    }
    return handleApiError(error, 'Failed to process senior record update/restore.');
  } finally {
    // Disconnecting prisma here might be problematic if other handlers are using it
    // Consider managing prisma client lifecycle at a higher level (e.g., in a middleware or global setup)
    // await prisma.$disconnect();
  }
}