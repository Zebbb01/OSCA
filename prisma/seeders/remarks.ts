// prisma\seeders\remarks.ts
import prisma from "../../lib/prisma"

export async function seedRemarks() {
    const remarks = ['NEW', 'TRANSFER', 'UPDATED', 'DECEASED','LOSS']

    await Promise.all(
        remarks.map((name, index) =>
            prisma.remarks.upsert({
                where: { name },
                update: { order: index + 1 },
                create: { name, order: index + 1 },
            })
        )
    )
}
