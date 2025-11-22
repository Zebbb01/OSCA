// app/api/dashboard/stats/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        // Get total counts
        const [
            totalSeniors,
            totalApplications,
            pendingSeniors,
            pwdCount,
            lowIncomeCount,
            regularCount,
            totalSeniorsAppliedForBenefits
        ] = await Promise.all([
            // Total active seniors (not deleted)
            prisma.senior.count({
                where: { deletedAt: null }
            }),
            
            // Total applications
            prisma.applications.count(),
            
            // Pending/Newly registered seniors (remarks with order 1 typically means "NEW/PENDING")
            prisma.senior.count({
                where: {
                    deletedAt: null,
                    remarks: {
                        order: 1
                    }
                }
            }),
            
            // PWD seniors
            prisma.senior.count({
                where: {
                    deletedAt: null,
                    pwd: true
                }
            }),
            
            // Low income seniors
            prisma.senior.count({
                where: {
                    deletedAt: null,
                    low_income: true
                }
            }),

            // Regular seniors (not PWD, not low income)
            prisma.senior.count({
                where: {
                    deletedAt: null,
                    pwd: false,
                    low_income: false
                }
            }),

            // Count distinct seniors who have applied for benefits
            prisma.senior.count({
                where: {
                    deletedAt: null,
                    Applications: {
                        some: {} // Has at least one application
                    }
                }
            })
        ])

        return NextResponse.json({
            success: true,
            data: {
                totalSeniors,
                totalApplications,
                totalPwdSeniors: pwdCount,
                newlyRegisteredSeniors: pendingSeniors,
                totalSeniorsAppliedForBenefits,
                categoryCounts: {
                    Special: pwdCount, // PWD are considered special
                    Regular: regularCount,
                    LowIncome: lowIncomeCount
                }
            }
        }, { status: 200 })

    } catch (error) {
        console.error('GET /api/dashboard/stats error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch dashboard statistics',
                error: String(error),
            },
            { status: 500 }
        )
    }
}