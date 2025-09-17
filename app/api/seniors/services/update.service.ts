// app/api/seniors/services/update.service.ts
import prisma from '@/lib/prisma';
import { differenceInYears } from 'date-fns';
import { updateSeniorAgeIfApplicable } from './helpers.service';

/**
 * Updates an existing senior record and their related applications' categories based on PWD status.
 */
export async function updateSenior(seniorId: number, updatePayload: any) {
  Object.keys(updatePayload).forEach(key => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  if (updatePayload.birthDate) {
    const newBirthDate = new Date(updatePayload.birthDate);
    const now = new Date();
    const newCalculatedAge = differenceInYears(now, newBirthDate);
    updatePayload.age = String(newCalculatedAge);
    updatePayload.birthdate = newBirthDate;
  } else if (updatePayload.age !== undefined) {
    updatePayload.age = String(updatePayload.age);
  }

  const currentSenior = await prisma.senior.findUnique({
    where: { id: seniorId },
    include: {
      Applications: true,
    },
  });

  if (!currentSenior) {
    throw new Error('Senior record not found.');
  }

  const oldPwdStatus = currentSenior.pwd;
  const newPwdStatus = typeof updatePayload.pwd === 'boolean' ? updatePayload.pwd : oldPwdStatus;

  const updatedSenior = await prisma.senior.update({
    where: { id: seniorId },
    data: {
      ...updatePayload,
      pwd: newPwdStatus,
      updatedAt: new Date(),
    },
  });

  if (newPwdStatus !== oldPwdStatus) {
    const regularCategory = await prisma.seniorCategory.findUnique({ where: { name: 'Regular senior citizens' } });
    const specialCategory = await prisma.seniorCategory.findUnique({ where: { name: 'Special assistance cases' } });

    if (!regularCategory || !specialCategory) {
      console.warn("Senior categories 'Regular senior citizens' or 'Special assistance cases' not found. Cannot update application categories based on PWD status.");
    } else {
      const targetCategoryId = newPwdStatus ? specialCategory.id : regularCategory.id;
      const applicationsToModify = currentSenior.Applications.filter(
        (app) => app.category_id !== targetCategoryId
      );

      if (applicationsToModify.length > 0) {
        await prisma.applications.updateMany({
          where: {
            senior_id: seniorId,
            id: {
              in: applicationsToModify.map(app => app.id)
            }
          },
          data: {
            category_id: targetCategoryId,
            updatedAt: new Date(),
          },
        });
      }
    }
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