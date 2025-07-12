// app\api\seniors\counts\route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const totalSeniors = await prisma.senior.count()
        const totalPwdSeniors = await prisma.senior.count({
            where: {
                pwd: true,
            },
        })

        const specialCategory = await prisma.seniorCategory.findUnique({
            where: { name: 'Special assistance cases' },
            select: { id: true },
        })

        const regularCategory = await prisma.seniorCategory.findUnique({
            where: { name: 'Regular senior citizens' },
            select: { id: true },
        })

        const specialSeniorsCount = specialCategory
            ? await prisma.applications.count({
                where: { category_id: specialCategory.id },
            })
            : 0

        const regularSeniorsCount = regularCategory
            ? await prisma.applications.count({
                where: { category_id: regularCategory.id },
            })
            : 0

        // --- NEWLY ADDED LOGIC ---

        // 1. Count of seniors per barangay
        const seniorsByBarangay = await prisma.senior.groupBy({
            by: ['barangay'],
            _count: {
                id: true, // Count seniors by their ID within each barangay group
            },
            orderBy: {
                _count: {
                    id: 'desc', // Order by count descending
                },
            },
        })

        // Format the barangay counts into a more accessible object
        const barangayCounts = seniorsByBarangay.reduce((acc, curr) => {
            acc[curr.barangay] = curr._count.id
            return acc
        }, {} as Record<string, number>)

        // 2. Count of newly registered seniors (last 24 hours)
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24 * 3) // Adjusted to 72 hours(3days) for testing purposes

        const newlyRegisteredSeniors = await prisma.senior.count({
            where: {
                createdAt: {
                    gte: twentyFourHoursAgo, // Greater than or equal to 24 hours ago
                },
            },
        })

        // --- END OF NEWLY ADDED LOGIC ---

        return NextResponse.json(
            {
                totalSeniors,
                totalPwdSeniors,
                categoryCounts: {
                    Special: specialSeniorsCount,
                    Regular: regularSeniorsCount,
                },
                barangayCounts, // Add barangay counts to the response
                newlyRegisteredSeniors, // Add newly registered seniors count to the response
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('GET /api/seniors/counts error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch senior counts',
                error: String(error),
            },
            { status: 500 }
        )
    }
}
