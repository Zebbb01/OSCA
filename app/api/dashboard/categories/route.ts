// app/api/dashboard/categories/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        // Get all senior categories with their counts
        const categories = await prisma.seniorCategory.findMany({
            orderBy: { order: 'asc' }
        })

        // Get count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await prisma.applications.count({
                    where: {
                        category_id: category.id,
                        senior: {
                            deletedAt: null
                        }
                    }
                })

                return {
                    name: category.name,
                    value: count,
                    color: getCategoryColor(category.name)
                }
            })
        )

        // Also get PWD and Low Income counts
        const [pwdCount, lowIncomeCount] = await Promise.all([
            prisma.senior.count({
                where: {
                    deletedAt: null,
                    pwd: true
                }
            }),
            prisma.senior.count({
                where: {
                    deletedAt: null,
                    low_income: true
                }
            })
        ])

        // Get regular seniors (not PWD, not low income, not in special categories)
        const regularCount = await prisma.senior.count({
            where: {
                deletedAt: null,
                pwd: false,
                low_income: false
            }
        })

        const categoriesData = [
            { name: 'Regular', value: regularCount, color: '#22c55e' },
            ...categoriesWithCount.filter(c => 
                !['Regular senior citizens', 'PWD', 'Low Income'].includes(c.name)
            )
        ]

        return NextResponse.json({
            success: true,
            data: categoriesData
        }, { status: 200 })

    } catch (error) {
        console.error('GET /api/dashboard/categories error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch category distribution',
                error: String(error),
            },
            { status: 500 }
        )
    }
}

function getCategoryColor(categoryName: string): string {
    const colorMap: Record<string, string> = {
        'Regular senior citizens': '#22c55e',
        'Special assistance cases': '#ef4444',

    }
    return colorMap[categoryName] || '#6b7280'
}