import bcrypt from "bcryptjs"
import prisma from "../prisma"

export async function seedAdmin() {
    const existingUser = await prisma.user.findFirst({
        where: {
            username: 'admin@admin',
        },
    })

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('admin123', 10)

        const admin = await prisma.user.create({
            data: {
                name: 'Administrator',
                firstName: 'Admin',
                lastName: 'User',
                contactNo: '09123456789',
                bday: new Date('1990-01-01'),
                username: 'admin@admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                emailVerified: new Date(), // Set emailVerified to the current date
                role: 'ADMIN',
            },
        })

        console.log('Created admin user:', admin.username)
    } else {
        console.log('Admin user already exists, skipping creation')
    }
}