// app/api/seniors/services/helpers.service.ts
import cloudinary from '@/lib/cloudinary';
import prisma from '@/lib/prisma';
import { differenceInYears } from 'date-fns';

/**
 * Helper function to upload a file to Cloudinary and record it in the database.
 */
export async function uploadAndSaveDocument(
  file: File,
  seniorId: number,
  tag: string,
  subfolder?: string,
  benefitRequirementId?: number | null
) {
  if (!(file instanceof File)) {
    console.warn(`Skipping upload for non-File object for tag "${tag}".`);
    return null;
  }

  const baseFolderPath = `registration/documents/${seniorId}`;
  const cloudinaryFolderPath = subfolder ? `${baseFolderPath}/${subfolder}` : baseFolderPath;
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
 * Helper to check and update a senior's age in the database if their birthday has passed.
 */
export async function updateSeniorAgeIfApplicable(senior: any) {
  const birthdate = senior.birthdate;
  const storedAge = parseInt(senior.age || '0');
  const now = new Date();
  const currentCalculatedAge = differenceInYears(now, birthdate);

  if (currentCalculatedAge > storedAge) {
    try {
      await prisma.senior.update({
        where: { id: senior.id },
        data: { age: String(currentCalculatedAge) },
      });
      return { ...senior, age: String(currentCalculatedAge) };
    } catch (error) {
      console.error(`Failed to update age for senior ${senior.id}:`, error);
      return { ...senior, age: String(currentCalculatedAge) };
    }
  }
  return senior;
}