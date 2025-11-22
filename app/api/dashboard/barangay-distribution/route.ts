// app/api/dashboard/barangay-distribution/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        // Get all unique barangays
        const barangays = await prisma.senior.findMany({
            where: { deletedAt: null },
            select: { barangay: true },
            distinct: ['barangay']
        })

        // Get distribution data for each barangay
        const barangayDistribution = await Promise.all(
            barangays.map(async ({ barangay }) => {
                const [total, pwdCount, regularCount] = await Promise.all([
                    prisma.senior.count({
                        where: {
                            deletedAt: null,
                            barangay: barangay
                        }
                    }),
                    prisma.senior.count({
                        where: {
                            deletedAt: null,
                            barangay: barangay,
                            pwd: true
                        }
                    }),
                    prisma.senior.count({
                        where: {
                            deletedAt: null,
                            barangay: barangay,
                            pwd: false
                        }
                    })
                ])

                return {
                    barangay,
                    seniors: total,
                    pwd: pwdCount,
                    regular: regularCount
                }
            })
        )

        // Sort by total seniors descending
        barangayDistribution.sort((a, b) => b.seniors - a.seniors)

        return NextResponse.json({
            success: true,
            data: barangayDistribution
        }, { status: 200 })

    } catch (error) {
        console.error('GET /api/dashboard/barangay-distribution error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch barangay distribution',
                error: String(error),
            },
            { status: 500 }
        )
    }
}