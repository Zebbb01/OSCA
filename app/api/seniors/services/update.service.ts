// app/api/seniors/services/update.service.ts
import prisma from '@/lib/prisma';
import { differenceInYears } from 'date-fns';
import { updateSeniorAgeIfApplicable } from './helpers.service';
import { getUpdatedCategoryIfChanged } from '@/lib/utils/category-helper';

/**
 * Updates an existing senior record and their related applications' categories based on age.
 */
export async function updateSenior(seniorId: number, updatePayload: any) {
  Object.keys(updatePayload).forEach(key => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  const currentSenior = await prisma.senior.findUnique({
    where: { id: seniorId },
    include: {
      Applications: true,
    },
  });

  if (!currentSenior) {
    throw new Error('Senior record not found.');
  }

  const oldAge = parseInt(currentSenior.age, 10);
  let newAge = oldAge;

  // Calculate new age if birthdate is being updated
  if (updatePayload.birthDate) {
    const newBirthDate = new Date(updatePayload.birthDate);
    const now = new Date();
    newAge = differenceInYears(now, newBirthDate);
    updatePayload.age = String(newAge);
    updatePayload.birthdate = newBirthDate;
  } else if (updatePayload.age !== undefined) {
    newAge = parseInt(String(updatePayload.age), 10);
    updatePayload.age = String(newAge);
  }

  // Validate remarks_id if provided
  if (updatePayload.remarks_id !== undefined) {
    const remarksExists = await prisma.remarks.findUnique({
      where: { id: updatePayload.remarks_id }
    });
    
    if (!remarksExists) {
      throw new Error('Invalid remarks ID provided.');
    }
  }

  // Update the senior record
  const updatedSenior = await prisma.senior.update({
    where: { id: seniorId },
    data: {
      ...updatePayload,
      updatedAt: new Date(),
    },
  });

  // Check if age category changed and update applications accordingly
  const newCategoryId = await getUpdatedCategoryIfChanged(oldAge, newAge, prisma);
  
  if (newCategoryId !== null && currentSenior.Applications.length > 0) {
    // Update all applications to the new age-based category
    await prisma.applications.updateMany({
      where: {
        senior_id: seniorId,
      },
      data: {
        category_id: newCategoryId,
        updatedAt: new Date(),
      },
    });
  }

  const finalSeniorState = await updateSeniorAgeIfApplicable(updatedSenior);
  return finalSeniorState;
}

/**
 * Soft deletes a senior record.
 */
export async function softDeleteSenior(seniorId: number) {
  return await prisma.senior.update({
    where: { id: seniorId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Permanently deletes a senior record.
 */
export async function permanentDeleteSenior(seniorId: number) {
  return await prisma.senior.delete({ where: { id: seniorId } });
}

/**
 * Restores a soft-deleted senior record.
 */
export async function restoreSenior(seniorId: number) {
  return await prisma.senior.update({
    where: { id: seniorId },
    data: { deletedAt: null },
  });
}