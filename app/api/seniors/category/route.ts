import prisma from '@/lib/prisma'
import { PUTApiResponse } from '@/types/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const seniorCategories = await prisma.seniorCategory.findMany({
            select: {
                id: true,
                name: true,
            },
        })

        return NextResponse.json(seniorCategories, { status: 200 })
    } catch (error) {
        console.error('GET /api/seniors/category error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch senior categories', error: String(error) },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const res = await request.json()
        console.log('res body json: ', res)

        const updatedSeniorCategory = await prisma.applications.update({
            where: { id: res.application_id },
            data: {
                category_id: res.category_id,
            },
        })

        const resp: PUTApiResponse = {
            data: updatedSeniorCategory,
            msg: 'Senior Category Updated',
            code: 200,
        }

        return NextResponse.json(resp, { status: 200 })

    } catch (error) {
        console.error('PUT /api/seniors/category error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to updating senior category',
                error: String(error),
            },
            { status: 500 }
        )
    }
}
