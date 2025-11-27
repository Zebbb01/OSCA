// app/api/dashboard/barangay-distribution/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { determineCategoryByAge } from '@/lib/utils/category-helper'

export async function GET() {
    try {
        // 1. Get all categories from DB (sorted by order)
        const categoryList = await prisma.seniorCategory.findMany({
            orderBy: { order: 'asc' },
        })

        // 2. Get all seniors with their barangay
        const seniors = await prisma.senior.findMany({
            where: { deletedAt: null },
            select: {
                barangay: true,
                age: true
            }
        })

        // 3. Group by barangay and count categories
        const barangayMap = new Map<string, Record<string, number>>()

        seniors.forEach(senior => {
            const age = parseInt(senior.age, 10)
            const categoryName = determineCategoryByAge(age)

            if (!barangayMap.has(senior.barangay)) {
                // Initialize category counts for this barangay
                const categoryCounts: Record<string, number> = {}
                categoryList.forEach(cat => {
                    categoryCounts[cat.name] = 0
                })
                barangayMap.set(senior.barangay, categoryCounts)
            }

            // Increment the category count
            const counts = barangayMap.get(senior.barangay)!
            if (categoryName && counts.hasOwnProperty(categoryName)) {
                counts[categoryName]++
            } else {
                // Fallback to Regular if category determination fails
                counts['Regular (Below 80)']++
            }
        })

        // 4. Transform into array format for chart
        const barangayDistribution = Array.from(barangayMap.entries()).map(([barangay, counts]) => {
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
            return {
                barangay,
                total,
                ...counts // Spread all category counts
            }
        })

        // 5. Sort by total seniors descending
        barangayDistribution.sort((a, b) => b.total - a.total)

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