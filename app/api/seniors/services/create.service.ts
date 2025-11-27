// app/api/seniors/services/create.service.ts
import prisma from '@/lib/prisma';
import { Gender } from '@/lib/generated/prisma';
import { SeniorsFormDataType } from '@/types/seniors';
import { uploadAndSaveDocument } from './helpers.service';
import { getCategoryIdByAge } from '@/lib/utils/category-helper';

/**
 * Creates a new senior record and uploads associated documents.
 */
export async function createSenior(formData: FormData) {
  const birthDateStr = formData.get('birthDate') as string;
  const birthDate = new Date(birthDateStr);
  const ageFromForm = formData.get('age') as string;
  const age = parseInt(ageFromForm, 10);

  const seniorData: Partial<SeniorsFormDataType> = {
    firstName: formData.get('firstName') as string,
    middleName: formData.get('middleName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    age: ageFromForm,
    birthDate: birthDateStr,
    gender: formData.get('gender') as Gender,
    barangay: formData.get('barangay') as string,
    purok: formData.get('purok') as string,
    contactNumber: formData.get('contactNumber') as string,
    emergencyNumber: formData.get('emergencyNumber') as string,
    contactPerson: formData.get('contactPerson') as string,
    contactRelationship: formData.get('contactRelationship') as string,
    pwd: formData.get('pwd') === 'true',
    lowIncome: formData.get('lowIncome') === 'true',
  };

  const newRemark = await prisma.remarks.findFirst({
    where: { order: 1 },
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
      age: seniorData.age || '0',
      birthdate: birthDate,
      gender: (seniorData.gender as Gender) || '',
      barangay: seniorData.barangay || '',
      purok: seniorData.purok || '',
      contact_no: seniorData.contactNumber || '',
      emergency_no: seniorData.emergencyNumber || '',
      contact_person: seniorData.contactPerson || '',
      contact_relationship: seniorData.contactRelationship || '',
      pwd: seniorData.pwd ?? false,
      low_income: seniorData.lowIncome ?? false,
      remarks_id: newRemark.id,
    },
  });

  const uploadPromises: Promise<any>[] = [];
  const fileTags = ['birth_certificate', 'certificate_of_residency', 'government_issued_id', 'membership_certificate', 'id_photo'];

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
export async function updateSeniorDocuments(formData: FormData) {
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
    const errors = failedUploads.map(f => (f as PromiseRejectedResult).reason.message).join('; ');
    throw new Error(`Partial document upload failure: ${errors}`);
  }

  return { message: 'Benefit requirement documents uploaded successfully for existing senior.' };
}