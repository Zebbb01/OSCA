import { hashPassword } from '@/utils/password'
import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { seedAdmin } from './seeders/user'
import { seedRemarks } from './seeders/remarks'
import { seedSeniorCategories } from './seeders/category'
import { seedStatuses } from './seeders/status'

async function main() {
    await seedAdmin()
    await seedRemarks()
    await seedSeniorCategories()
    await seedStatuses()
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
