// prisma\seeders\category.ts
import prisma from "../../lib/prisma"

export async function seedSeniorCategories() {
    const categories = [
        'Regular (Below 80)',    
        'Octogenarian (80-89)',
        'Nonagenarian (90-99)',
        'Centenarian (100+)'
    ]

    await Promise.all(
        categories.map((name, index) =>
            prisma.seniorCategory.upsert({
                where: { name },
                update: { order: index + 1 },
                create: { name, order: index + 1 },
            })
        )
    )
}