// app\api\seniors\route.ts
import cloudinary from '@/lib/cloudinary';
import { Gender } from '@/lib/generated/prisma';
import prisma from '@/prisma/prisma';
import { SeniorsFormDataType } from '@/types/seniors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Helper function to upload a file to Cloudinary and record it in the database.
 * Now includes benefitRequirementId for specific linking.
 */
async function uploadAndSaveDocument(
  file: File,
  seniorId: number,
  tag: string, // This will be 'medical_assistance'
  subfolder?: string, // Optional subfolder for organization
  benefitRequirementId?: number | null // NEW: Optional ID for the specific benefit requirement
) {
  if (!(file instanceof File)) {
    console.warn(`Skipping upload for non-File object for tag "${tag}".`);
    return null;
  }

  const baseFolderPath = `registration/documents/${seniorId}`;
  const cloudinaryFolderPath = subfolder ? `${baseFolderPath}/${subfolder}` : baseFolderPath;
  const publicId = `${tag}_${seniorId}_${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryFolderPath,
          public_id: publicId,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    if (uploadResult) {
      // Modify this to store benefitRequirementId if your schema supports it
      await prisma.registrationDocument.create({
        data: {
          tag, // This will be 'medical_assistance'
          path: cloudinaryFolderPath,
          imageUrl: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          seniors_id: seniorId,
          file_name: file.name,
          // If you have a `benefitRequirementId` field in `RegistrationDocument`, add it here:
          // benefit_requirement_id: benefitRequirementId || null,
        },
      });
      return uploadResult;
    }
  } catch (err) {
    console.error(`Error processing file "${file.name}" for tag "${tag}":`, err);
    throw err;
  }
  return null;
}

/**
 * Handles the common error response for API routes.
 */
function handleApiError(error: any, message: string, status: number = 500) {
  console.error(`❌ API Error: ${message}`, error);
  return NextResponse.json({ success: false, message, error: error.message || String(error) }, { status });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    // --- FIX START ---
    // Change from 'seniorId' to 'id' to match frontend
    const seniorIdToUpdate = formData.get('id') as string | null;
    // --- FIX END ---
    const applicationId = formData.get('applicationId') as string | null;

    if (seniorIdToUpdate) {
      // Logic for updating existing senior with new documents for requirements
      const seniorId = parseInt(seniorIdToUpdate);
      const senior = await prisma.senior.findUnique({ where: { id: seniorId } });

      if (!senior) {
        return NextResponse.json({ message: 'Senior not found' }, { status: 404 });
      }

      const uploadPromises: Promise<any>[] = [];

      for (const [key, value] of formData.entries()) {
        // Ensure 'medical_assistance' is handled correctly and potentially linked to requirements
        if (key === 'medical_assistance' && value instanceof File) {
          // Assuming 'medical_assistance' files are general uploads, not tied to a specific requirement ID via form key
          uploadPromises.push(
            uploadAndSaveDocument(value, senior.id, 'medical_assistance', 'medical_assistance')
          );
        } else if (key.startsWith('requirement_') && value instanceof File) {
          // This handles files specifically for benefit requirements
          const requirementId = parseInt(key.replace('requirement_', ''));
          uploadPromises.push(
            uploadAndSaveDocument(value, senior.id, 'medical_assistance', 'medical_assistance', requirementId)
          );
        }
      }


      if (uploadPromises.length === 0) {
        // This might be the case if no files were actually appended, or keys didn't match.
        // Consider if this should be a 400 or a success with a message.
        // For document uploads, it's usually expected that files are provided.
        return NextResponse.json({ message: 'No documents provided for benefit requirements or medical assistance.' }, { status: 400 });
      }

      // Using Promise.allSettled to ensure all uploads are attempted,
      // even if one fails, others might succeed.
      const results = await Promise.allSettled(uploadPromises);

      const failedUploads = results.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        console.error('Some document uploads failed:', failedUploads);
        // Optionally return a 500 or 207 (Multi-Status) depending on your error handling preference
        return handleApiError(new Error('Partial document upload failure.'), 'Some documents failed to upload. Check server logs.', 500);
      }


      return NextResponse.json(
        { success: true, message: 'Benefit requirement documents uploaded successfully for existing senior.' },
        { status: 200 }
      );
    } else {
      // Original logic for creating a new senior (remains the same if not touched by this issue)
      const seniorData: Partial<SeniorsFormDataType> = {
        firstName: formData.get('firstName') as string,
        middleName: formData.get('middleName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        age: formData.get('age') as string,
        birthDate: formData.get('birthDate') as string,
        gender: formData.get('gender') as Gender,
        barangay: formData.get('barangay') as string,
        purok: formData.get('purok') as string,
        contactNumber: formData.get('contactNumber') as string,
        emergencyNumber: formData.get('emergencyNumber') as string,
        contactPerson: formData.get('contactPerson') as string,
        pwd: formData.get('pwd') === 'true',
      };

      const senior = await prisma.senior.create({
        data: {
          firstname: seniorData.firstName || '',
          middlename: seniorData.middleName || '',
          lastname: seniorData.lastName || '',
          email: seniorData.email || '',
          age: seniorData.age || '',
          birthdate: new Date(seniorData.birthDate || ''),
          gender: (seniorData.gender as Gender) || '',
          barangay: seniorData.barangay || '',
          purok: seniorData.purok || '',
          contact_no: seniorData.contactNumber || '',
          emergency_no: seniorData.emergencyNumber || '',
          contact_person: seniorData.contactPerson || '',
          pwd: seniorData.pwd ?? false,
        },
      });

      const uploadPromises: Promise<any>[] = [];
      const fileTags = ['birth_certificate', 'certificate_of_residency', 'government_issued_id', 'membership_certificate'];

      for (const tag of fileTags) {
        const file = formData.get(tag) as File | null;
        if (file) uploadPromises.push(uploadAndSaveDocument(file, senior.id, tag));
      }

      const medicalFiles = formData.getAll('medical_assistance') as File[];
      for (const file of medicalFiles) {
        uploadPromises.push(uploadAndSaveDocument(file, senior.id, 'medical_assistance', 'medical_assistance'));
      }

      for (const [key, value] of formData.entries()) {
        if (key.startsWith('requirement_') && value instanceof File) {
          const requirementId = parseInt(key.replace('requirement_', ''));
          uploadPromises.push(
            uploadAndSaveDocument(value, senior.id, 'medical_assistance', 'medical_assistance', requirementId)
          );
        }
      }

      await Promise.allSettled(uploadPromises);

      return NextResponse.json(
        { success: true, message: 'Senior Registered Successfully', senior: senior },
        { status: 201 }
      );
    }
  } catch (error: any) {
    // More specific error logging could be beneficial here
    console.error('Detailed POST API Error:', error);
    return handleApiError(error, 'Failed to process senior registration/update.');
  }
}


export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const nameSearch = searchParams.get('name');

    // --- NEW: Retrieve filter parameters for specific columns ---
    const genderFilter = searchParams.get('gender');
    const purokFilter = searchParams.get('purok');
    const barangayFilter = searchParams.get('barangay');
    const remarksFilter = searchParams.get('remarks');
    const releaseStatusFilter = searchParams.get('releaseStatus');

    const queryOptions: any = {
      include: {
        remarks: { select: { id: true, name: true } },
        documents: true,
        Applications: {
          include: {
            category: true,
            status: true,    // ADD THIS LINE - Include status information
            benefit: true,   // ADD THIS LINE - Include benefit information if needed
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      where: {
        deletedAt: null,
      },
    };

    // Apply name search filter
    if (nameSearch) {
      queryOptions.where.OR = [
        { firstname: { contains: nameSearch, mode: 'insensitive' } },
        { middlename: { contains: nameSearch, mode: 'insensitive' } },
        { lastname: { contains: nameSearch, mode: 'insensitive' } },
        { barangay: { contains: nameSearch, mode: 'insensitive' } },
        { purok: { contains: nameSearch, mode: 'insensitive' } },
      ];
    }

    // Gender filter
    if (genderFilter) {
      if (genderFilter === 'male' || genderFilter === 'female') {
        queryOptions.where.gender = genderFilter as Gender;
      }
    }

    // Purok filter
    if (purokFilter) {
      queryOptions.where.purok = purokFilter;
    }

    // Barangay filter
    if (barangayFilter) {
      queryOptions.where.barangay = barangayFilter;
    }

    // Remarks filter
    if (remarksFilter) {
      queryOptions.where.remarks = {
        name: remarksFilter
      };
    }

    // Release Status filter
    if (releaseStatusFilter) {
      if (releaseStatusFilter === 'Released') {
        queryOptions.where.releasedAt = { not: null };
      } else if (releaseStatusFilter === 'Not Released') {
        queryOptions.where.releasedAt = null;
      }
    }

    const seniors = await prisma.senior.findMany(queryOptions);
    return NextResponse.json(seniors);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch seniors.');
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    let seniorId: number;
    let updateData: any; // Keep as 'any' for now or define a more precise input DTO for the API

    if (action === 'restore') {
      const idParam = searchParams.get('id');
      if (!idParam || isNaN(parseInt(idParam, 10))) {
        return handleApiError(new Error('Invalid Senior ID for restore.'), 'Senior ID is required for restore action.', 400);
      }
      seniorId = parseInt(idParam, 10);
      updateData = { deletedAt: null }; // Set updateData for restore
    } else {
      const body = await request.json();

      if (body.id === undefined || isNaN(parseInt(body.id))) {
        return handleApiError(new Error('Invalid Senior ID for update.'), 'Senior ID is required in the request body for update.', 400);
      }
      seniorId = parseInt(body.id, 10);

      // Define the update payload, matching Prisma schema types
      updateData = {
        firstname: body.firstname,
        middlename: body.middlename,
        lastname: body.lastname,
        age: body.age, // Prisma takes string, ensure it's a string here
        birthdate: body.birthdate, // Prisma takes DateTime, expect ISO string here
        gender: body.gender, // Prisma takes Gender enum ('male' | 'female')
        email: body.email,
        contact_no: body.contact_no,
        emergency_no: body.emergency_no,
        barangay: body.barangay,
        purok: body.purok,
        pwd: body.pwd,
        contact_person: body.contact_person, // Corrected to contact_person
        // Do NOT include fields like remarks, Applications, documents, etc. unless you intend to update them
      };

      // Filter out undefined values to avoid updating fields not provided
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
    }

    const updatedSenior = await prisma.senior.update({
      where: { id: seniorId },
      data: updateData, // Use the dynamically set updateData
    });

    return NextResponse.json({ success: true, message: `Senior record ${action === 'restore' ? 'restored' : 'updated'} successfully.`, data: updatedSenior });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return handleApiError(error, 'Senior record not found for the provided ID.', 404);
    }
    return handleApiError(error, 'Failed to process senior record update/restore.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET_ARCHIVED(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const nameSearch = searchParams.get('name');

    const queryOptions: any = {
      include: { remarks: { select: { id: true, name: true } } },
      where: { NOT: { deletedAt: null } },
    };

    if (nameSearch) {
      queryOptions.where.OR = ['firstname', 'middlename', 'lastname'].map(field => ({
        [field]: { contains: nameSearch, mode: 'insensitive' },
      }));
    }

    const archivedSeniors = await prisma.senior.findMany(queryOptions);
    return NextResponse.json(archivedSeniors);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch archived seniors.');
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const action = searchParams.get('action');

    if (!idParam || isNaN(parseInt(idParam, 10))) {
      return handleApiError(new Error('Invalid Senior ID.'), 'Senior ID is required for deletion.', 400);
    }

    const seniorId = parseInt(idParam, 10);

    if (action === 'permanent') {
      await prisma.senior.delete({ where: { id: seniorId } });
      return NextResponse.json({ success: true, message: `Senior with ID ${seniorId} permanently deleted.` }, { status: 200 });
    } else {
      await prisma.senior.update({
        where: { id: seniorId },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: `Senior with ID ${seniorId} soft-deleted.` }, { status: 200 });
    }
  } catch (error: any) {
    if (error.code === 'P2025') {
      return handleApiError(error, 'Senior record not found for deletion.', 404);
    }
    return handleApiError(error, 'Failed to delete senior.');
  }
}

// The PATCH method for restore is now largely redundant due to the PUT handler's 'restore' action.
// However, if you prefer to keep it separate for semantic reasons or future distinct PATCH actions,
// here's a slightly streamlined version:
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id || action !== 'restore' || isNaN(parseInt(id, 10))) {
      return handleApiError(
        new Error('Invalid request for PATCH.'),
        'Senior ID and "action=restore" are required and ID must be a number.',
        400
      );
    }

    const restoredSenior = await prisma.senior.update({
      where: { id: parseInt(id) },
      data: { deletedAt: null },
    });

    return NextResponse.json(
      { success: true, message: `Senior with ID ${id} restored successfully.`, data: restoredSenior },
      { status: 200 }
    );
  } catch (error: any) {
    return handleApiError(error, 'Failed to restore senior.');
  }
}