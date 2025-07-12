import prisma from "../../lib/prisma"

export async function seedSeniorCategories() {
    const categories = ['Regular senior citizens', 'Special assistance cases']

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
