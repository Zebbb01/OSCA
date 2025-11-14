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

        // --- COUNT SENIORS WHO APPLIED FOR BENEFITS ---
        // Get unique senior IDs from Applications table
        const seniorsWithApplications = await prisma.applications.findMany({
            select: {
                senior_id: true,
            },
            distinct: ['senior_id'],
        })
        
        const totalSeniorsAppliedForBenefits = seniorsWithApplications.length

        // --- BARANGAY COUNTS ---
        const seniorsByBarangay = await prisma.senior.groupBy({
            by: ['barangay'],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        })

        const barangayCounts = seniorsByBarangay.reduce((acc, curr) => {
            acc[curr.barangay] = curr._count.id
            return acc
        }, {} as Record<string, number>)

        // --- NEWLY REGISTERED SENIORS ---
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24 * 3) // 72 hours for testing

        const newlyRegisteredSeniors = await prisma.senior.count({
            where: {
                createdAt: {
                    gte: twentyFourHoursAgo,
                },
            },
        })

        return NextResponse.json(
            {
                totalSeniors,
                totalPwdSeniors,
                totalSeniorsAppliedForBenefits, // NEW: Count of seniors who applied for benefits
                categoryCounts: {
                    Special: specialSeniorsCount,
                    Regular: regularSeniorsCount,
                },
                barangayCounts,
                newlyRegisteredSeniors,
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