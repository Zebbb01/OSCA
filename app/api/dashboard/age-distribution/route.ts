// app/api/dashboard/age-distribution/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        // Get all active seniors with age and gender
        const seniors = await prisma.senior.findMany({
            where: { deletedAt: null },
            select: {
                age: true,
                gender: true
            }
        })

        // Define age groups
        const ageGroups = [
            { name: '60-65', min: 60, max: 65 },
            { name: '66-70', min: 66, max: 70 },
            { name: '71-75', min: 71, max: 75 },
            { name: '76-80', min: 76, max: 80 },
            { name: '81-85', min: 81, max: 85 },
            { name: '85+', min: 86, max: 200 }
        ]

        // Count seniors by age group and gender
        const distribution = ageGroups.map(group => {
            const maleCount = seniors.filter(s => {
                const age = parseInt(s.age)
                return age >= group.min && age <= group.max && s.gender === 'male'
            }).length

            const femaleCount = seniors.filter(s => {
                const age = parseInt(s.age)
                return age >= group.min && age <= group.max && s.gender === 'female'
            }).length

            return {
                ageGroup: group.name,
                male: maleCount,
                female: femaleCount
            }
        })

        return NextResponse.json({
            success: true,
            data: distribution
        }, { status: 200 })

    } catch (error) {
        console.error('GET /api/dashboard/age-distribution error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch age distribution',
                error: String(error),
            },
            { status: 500 }
        )
    }
}