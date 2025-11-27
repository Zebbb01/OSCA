// lib/utils/category-helper.ts

/**
 * Determines the senior category based on age
 * @param age - The age of the senior citizen
 * @returns The category name or null if age doesn't fit any category
 */
export function determineCategoryByAge(age: number): string | null {
  if (age >= 100) {
    return 'Centenarian (100+)';
  } else if (age >= 90) {
    return 'Nonagenarian (90-99)';
  } else if (age >= 80) {
    return 'Octogenarian (80-89)';
  }
  return null; // Below 80, no special category
}

/**
 * Gets the category ID for a given age
 * @param age - The age of the senior citizen
 * @returns Promise resolving to category ID or null
 */
export async function getCategoryIdByAge(age: number, prisma: any): Promise<number | null> {
  const categoryName = determineCategoryByAge(age);
  
  if (!categoryName) {
    return null;
  }

  const category = await prisma.seniorCategory.findUnique({
    where: { name: categoryName },
    select: { id: true }
  });

  return category?.id || null;
}

/**
 * Checks if age category has changed and returns new category ID if needed
 * @param oldAge - Previous age
 * @param newAge - New age
 * @param prisma - Prisma client instance
 * @returns Promise resolving to new category ID or null if no change
 */
export async function getUpdatedCategoryIfChanged(
  oldAge: number, 
  newAge: number, 
  prisma: any
): Promise<number | null> {
  const oldCategory = determineCategoryByAge(oldAge);
  const newCategory = determineCategoryByAge(newAge);
  
  if (oldCategory === newCategory) {
    return null; // No change needed
  }
  
  // If new category exists, return its ID
  if (newCategory) {
    const category = await prisma.seniorCategory.findUnique({
      where: { name: newCategory },
      select: { id: true }
    });
    return category?.id || null;
  }
  
  return null;
}