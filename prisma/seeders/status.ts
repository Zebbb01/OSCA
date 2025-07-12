import prisma from "../../lib/prisma"

export async function seedStatuses() {
    const statuses = ['PENDING', 'APPROVED', 'REJECT']

    await Promise.all(
        statuses.map((name, index) =>
            prisma.status.upsert({
                where: { name },
                update: { order: index + 1 },
                create: { name, order: index + 1 },
            })
        )
    )
}
