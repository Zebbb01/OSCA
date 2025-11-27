// app/api/seniors/counts/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const totalSeniors = await prisma.senior.count({
            where: {
                deletedAt: null
            }
        })
        
        const totalPwdSeniors = await prisma.senior.count({
            where: {
                pwd: true,
                deletedAt: null
            },
        })

        // Get age-based category counts
        const octogenarianCategory = await prisma.seniorCategory.findUnique({
            where: { name: 'Octogenarian (80-89)' },
            select: { id: true },
        })

        const nonagenariCategory = await prisma.seniorCategory.findUnique({
            where: { name: 'Nonagenarian (90-99)' },
            select: { id: true },
        })

        const centenarianCategory = await prisma.seniorCategory.findUnique({
            where: { name: 'Centenarian (100+)' },
            select: { id: true },
        })

        const octogenarianCount = octogenarianCategory
            ? await prisma.applications.count({
                where: { 
                    category_id: octogenarianCategory.id,
                    senior: {
                        deletedAt: null
                    }
                },
            })
            : 0

        const nonagenariCount = nonagenariCategory
            ? await prisma.applications.count({
                where: { 
                    category_id: nonagenariCategory.id,
                    senior: {
                        deletedAt: null
                    }
                },
            })
            : 0

        const centenarianCount = centenarianCategory
            ? await prisma.applications.count({
                where: { 
                    category_id: centenarianCategory.id,
                    senior: {
                        deletedAt: null
                    }
                },
            })
            : 0

        // Get count of seniors with no category (age < 80)
        const regularSeniorsCount = await prisma.applications.count({
            where: {
                category_id: null,
                senior: {
                    deletedAt: null
                }
            }
        })

        // --- COUNT SENIORS WHO APPLIED FOR BENEFITS ---
        const seniorsWithApplications = await prisma.applications.findMany({
            where: {
                senior: {
                    deletedAt: null
                }
            },
            select: {
                senior_id: true,
            },
            distinct: ['senior_id'],
        })
        
        const totalSeniorsAppliedForBenefits = seniorsWithApplications.length

        // --- BARANGAY COUNTS ---
        const seniorsByBarangay = await prisma.senior.groupBy({
            by: ['barangay'],
            where: {
                deletedAt: null
            },
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
        const seventyTwoHoursAgo = new Date()
        seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72)

        const newlyRegisteredSeniors = await prisma.senior.count({
            where: {
                createdAt: {
                    gte: seventyTwoHoursAgo,
                },
                deletedAt: null
            },
        })

        return NextResponse.json(
            {
                totalSeniors,
                totalPwdSeniors,
                totalSeniorsAppliedForBenefits,
                categoryCounts: {
                    Regular: regularSeniorsCount,
                    'Octogenarian (80-89)': octogenarianCount,
                    'Nonagenarian (90-99)': nonagenariCount,
                    'Centenarian (100+)': centenarianCount,
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