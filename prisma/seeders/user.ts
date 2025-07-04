import bcrypt from "bcryptjs"
import prisma from "../prisma"

export async function seedAdmin() {
    const existingUser = await prisma.user.findFirst({
        where: {
            username: 'Administrator',
        },
    })

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('admin123', 10)

        const admin = await prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'User',
                contactNo: '09123456789',
                bday: new Date('1990-01-01'),
                username: 'Administrator',
                email: 'admin@admin',
                password: hashedPassword,
                emailVerified: new Date(),
                role: 'ADMIN',
            },
        })

        console.log('Created admin user:', admin.username)
    } else {
        console.log('Admin user already exists, skipping creation')
    }
}