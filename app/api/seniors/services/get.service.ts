// app/api/seniors/services/get.service.ts
import prisma from '@/lib/prisma';
import { Gender } from '@/lib/generated/prisma';
import { updateSeniorAgeIfApplicable } from './helpers.service';

/**
 * Fetches senior records based on provided filters.
 */
export async function getSeniors(searchParams: URLSearchParams) {
  const nameSearch = searchParams.get('name');
  const genderFilter = searchParams.get('gender');
  const purokFilter = searchParams.get('purok');
  const barangayFilter = searchParams.get('barangay');
  const remarksFilter = searchParams.get('remarks');
  const releaseStatusFilter = searchParams.get('releaseStatus');

  const queryOptions: any = {
    include: {
      remarks: { select: { id: true, name: true } },
      documents: {
        include: {
          benefitRequirement: {
            select: {
              id: true,
              name: true,
              benefit: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      Applications: {
        include: {
          category: true,
          status: true,
          benefit: true,
        },
        orderBy: { createdAt: 'desc' },
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
    } else if (releaseStatusFilter === 'Pending') {
      queryOptions.where.releasedAt = null;
    }
  }

  const seniors = await prisma.senior.findMany(queryOptions);

  const updatedSeniors = await Promise.all(
    seniors.map(senior => updateSeniorAgeIfApplicable(senior))
  );

  return updatedSeniors;
}

/**
 * Fetches archived senior records.
 */
export async function getArchivedSeniors(searchParams: URLSearchParams) {
  const nameSearch = searchParams.get('name');

  const queryOptions: any = {
    include: { 
      remarks: { select: { id: true, name: true } },
      // ✅ FIXED: Also include benefitRequirement for archived seniors
      documents: {
        include: {
          benefitRequirement: {
            select: {
              id: true,
              name: true,
              benefit: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    where: { NOT: { deletedAt: null } },
  };

  if (nameSearch) {
    queryOptions.where.OR = ['firstname', 'middlename', 'lastname'].map(field => ({
      [field]: { contains: nameSearch, mode: 'insensitive' },
    }));
  }

  const archivedSeniors = await prisma.senior.findMany(queryOptions);

  const updatedArchivedSeniors = await Promise.all(
    archivedSeniors.map(senior => updateSeniorAgeIfApplicable(senior))
  );

  return updatedArchivedSeniors;
}