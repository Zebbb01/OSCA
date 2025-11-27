// app/api/dashboard/categories/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { determineCategoryByAge } from '@/lib/utils/category-helper'

export async function GET() {
    try {
        // 1. Load categories from DB (sorted by `order`)
        const categoryList = await prisma.seniorCategory.findMany({
            orderBy: { order: 'asc' },
        })

        // Prepare count container
        const categoryCounts: Record<string, number> = {}
        categoryList.forEach(cat => {
            categoryCounts[cat.name] = 0
        })

        // 2. Get all non-deleted seniors
        const seniors = await prisma.senior.findMany({
            where: { deletedAt: null },
            select: {
                age: true,
            }
        })

        // 3. Count seniors by age category
        seniors.forEach(senior => {
            const age = parseInt(senior.age, 10)
            const categoryName = determineCategoryByAge(age)

            // Categorize by age regardless of application status
            if (categoryName && categoryCounts.hasOwnProperty(categoryName)) {
                categoryCounts[categoryName]++
            } else {
                // Fallback if category determination fails
                console.warn(`Could not determine category for age ${age}`)
                categoryCounts['Regular (Below 80)']++
            }
        })

        // 4. Build final sorted dataset
        const categoriesData = categoryList.map(cat => ({
            name: cat.name,
            value: categoryCounts[cat.name] || 0,
            color:
                cat.name === 'Regular (Below 80)' ? '#22c55e' :
                cat.name === 'Octogenarian (80-89)' ? '#3b82f6' :
                cat.name === 'Nonagenarian (90-99)' ? '#f59e0b' :
                cat.name === 'Centenarian (100+)' ? '#ef4444' :
                '#6b7280'
        }))

        return NextResponse.json(
            { success: true, data: categoriesData },
            { status: 200 }
        )

    } catch (error) {
        console.error('GET /api/dashboard/categories error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch category distribution' },
            { status: 500 }
        )
    }
}