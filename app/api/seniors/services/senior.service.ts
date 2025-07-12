// src/app/api/seniors/services/senior.service.ts
import cloudinary from '@/lib/cloudinary';
import prisma from '@/lib/prisma';
import { Gender } from '@/lib/generated/prisma';
import { SeniorsFormDataType } from '@/types/seniors';

/**
 * Helper function to upload a file to Cloudinary and record it in the database.
 * Now includes benefitRequirementId for specific linking.
 */
async function uploadAndSaveDocument(
  file: File,
  seniorId: number,
  tag: string, // e.g., 'medical_assistance', 'birth_certificate'
  subfolder?: string, // Optional subfolder for organization
  benefitRequirementId?: number | null // Optional ID for the specific benefit requirement
) {
  if (!(file instanceof File)) {
    console.warn(`Skipping upload for non-File object for tag "${tag}".`);
    return null;
  }

  const baseFolderPath = `registration/documents/${seniorId}`;
  const cloudinaryFolderPath = subfolder ? `${baseFolderPath}/${subfolder}` : baseFolderPath;
  // Sanitize file name for public_id to prevent issues with special characters
  const safeFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const publicId = `${tag}_${seniorId}_${Date.now()}_${safeFileName}`;

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
      await prisma.registrationDocument.create({
        data: {
          tag,
          path: cloudinaryFolderPath,
          imageUrl: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          seniors_id: seniorId,
          file_name: file.name,
          benefit_requirement_id: benefitRequirementId || null,
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
 * Creates a new senior record and uploads associated documents.
 */
async function createSenior(formData: FormData) {
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

  const newRemark = await prisma.remarks.findFirst({
    where: { order: 1 }, // Assuming 'NEW' always has order 1
  });

  if (!newRemark) {
    throw new Error('Remarks "NEW" not found. Please ensure your database is seeded.');
  }

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
      remarks_id: newRemark.id,
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

  return senior;
}

/**
 * Updates an existing senior's documents for requirements.
 */
async function updateSeniorDocuments(formData: FormData) {
  const seniorIdToUpdate = formData.get('id') as string | null;
  if (!seniorIdToUpdate) {
    throw new Error('Senior ID is required for updating documents.');
  }

  const seniorId = parseInt(seniorIdToUpdate);
  const senior = await prisma.senior.findUnique({ where: { id: seniorId } });

  if (!senior) {
    throw new Error('Senior not found for document update.');
  }

  const uploadPromises: Promise<any>[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === 'medical_assistance' && value instanceof File) {
      uploadPromises.push(
        uploadAndSaveDocument(value, senior.id, 'medical_assistance', 'medical_assistance')
      );
    } else if (key.startsWith('requirement_') && value instanceof File) {
      const requirementId = parseInt(key.replace('requirement_', ''));
      uploadPromises.push(
        uploadAndSaveDocument(value, senior.id, 'medical_assistance', 'medical_assistance', requirementId)
      );
    }
  }

  if (uploadPromises.length === 0) {
    return { message: 'No documents provided for benefit requirements or medical assistance.' };
  }

  const results = await Promise.allSettled(uploadPromises);
  const failedUploads = results.filter(result => result.status === 'rejected');

  if (failedUploads.length > 0) {
    // Collect specific errors if needed, or re-throw a combined error
    const errors = failedUploads.map(f => (f as PromiseRejectedResult).reason.message).join('; ');
    throw new Error(`Partial document upload failure: ${errors}`);
  }

  return { message: 'Benefit requirement documents uploaded successfully for existing senior.' };
}

/**
 * Fetches senior records based on provided filters.
 */
async function getSeniors(searchParams: URLSearchParams) {
  const nameSearch = searchParams.get('name');
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
          status: true,
          benefit: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    where: {
      deletedAt: null,
    },
  };

  if (nameSearch) {
    queryOptions.where.OR = [
      { firstname: { contains: nameSearch, mode: 'insensitive' } },
      { middlename: { contains: nameSearch, mode: 'insensitive' } },
      { lastname: { contains: nameSearch, mode: 'insensitive' } },
      { barangay: { contains: nameSearch, mode: 'insensitive' } },
      { purok: { contains: nameSearch, mode: 'insensitive' } },
    ];
  }

  if (genderFilter) {
    if (genderFilter === 'male' || genderFilter === 'female') {
      queryOptions.where.gender = genderFilter as Gender;
    }
  }

  if (purokFilter) {
    queryOptions.where.purok = purokFilter;
  }

  if (barangayFilter) {
    queryOptions.where.barangay = barangayFilter;
  }

  if (remarksFilter) {
    queryOptions.where.remarks = {
      name: remarksFilter
    };
  }

  if (releaseStatusFilter) {
    if (releaseStatusFilter === 'Released') {
      queryOptions.where.releasedAt = { not: null };
    } else if (releaseStatusFilter === 'Not Released') {
      queryOptions.where.releasedAt = null;
    }
  }

  return await prisma.senior.findMany(queryOptions);
}

/**
 * Fetches archived senior records.
 */
async function getArchivedSeniors(searchParams: URLSearchParams) {
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

  return await prisma.senior.findMany(queryOptions);
}

/**
 * Updates an existing senior record.
 */
async function updateSenior(seniorId: number, updatePayload: any) {
  // Filter out undefined values to avoid updating fields not provided
  Object.keys(updatePayload).forEach(key => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  return await prisma.senior.update({
    where: { id: seniorId },
    data: updatePayload,
  });
}

/**
 * Soft deletes a senior record.
 */
async function softDeleteSenior(seniorId: number) {
  return await prisma.senior.update({
    where: { id: seniorId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Permanently deletes a senior record.
 */
async function permanentDeleteSenior(seniorId: number) {
  return await prisma.senior.delete({ where: { id: seniorId } });
}

/**
 * Restores a soft-deleted senior record.
 */
async function restoreSenior(seniorId: number) {
  return await prisma.senior.update({
    where: { id: seniorId },
    data: { deletedAt: null },
  });
}

export const seniorService = {
  createSenior,
  updateSeniorDocuments,
  getSeniors,
  getArchivedSeniors,
  updateSenior,
  softDeleteSenior,
  permanentDeleteSenior,
  restoreSenior,
};