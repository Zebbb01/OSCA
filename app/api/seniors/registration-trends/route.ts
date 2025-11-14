// app/api/seniors/registration-trends/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const view = searchParams.get('view') || 'monthly' // 'monthly' or 'yearly'
        const year = searchParams.get('year') || new Date().getFullYear().toString()

        if (view === 'monthly') {
            // Get monthly registration data for the specified year
            const monthlyData = await prisma.$queryRaw<Array<{ month: number; count: bigint }>>`
                SELECT 
                    EXTRACT(MONTH FROM "createdAt") as month,
                    COUNT(*)::bigint as count
                FROM "senior"
                WHERE EXTRACT(YEAR FROM "createdAt") = ${parseInt(year)}
                GROUP BY EXTRACT(MONTH FROM "createdAt")
                ORDER BY month ASC
            `

            // Create array with all 12 months
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ]

            const formattedData = monthNames.map((monthName, index) => {
                const monthNumber = index + 1
                const dataPoint = monthlyData.find(d => Number(d.month) === monthNumber)
                return {
                    month: monthName,
                    seniors: dataPoint ? Number(dataPoint.count) : 0
                }
            })

            return NextResponse.json({
                view: 'monthly',
                year: parseInt(year),
                data: formattedData
            }, { status: 200 })

        } else {
            // Get yearly registration data
            const yearlyData = await prisma.$queryRaw<Array<{ year: number; count: bigint }>>`
                SELECT 
                    EXTRACT(YEAR FROM "createdAt") as year,
                    COUNT(*)::bigint as count
                FROM "senior"
                GROUP BY EXTRACT(YEAR FROM "createdAt")
                ORDER BY year ASC
            `

            const formattedData = yearlyData.map(d => ({
                year: d.year.toString(),
                seniors: Number(d.count)
            }))

            return NextResponse.json({
                view: 'yearly',
                data: formattedData
            }, { status: 200 })
        }

    } catch (error) {
        console.error('GET /api/seniors/registration-trends error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch registration trends',
                error: String(error),
            },
            { status: 500 }
        )
    }
}