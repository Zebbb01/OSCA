// app/api/categories/route.ts
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const categories = await prisma.seniorCategory.findMany({
            select: {
                id: true,
                name: true,
                order: true,
            },
            orderBy: {
                order: 'asc',
            },
        })

        return NextResponse.json(categories, { status: 200 })
    } catch (error) {
        console.error('GET /api/categories error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories', error: String(error) },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const res = await request.json()
        console.log('res body json: ', res)

        const updatedApplicationCategory = await prisma.applications.update({
            where: { id: res.application_id },
            data: {
                category_id: res.category_id,
            },
        })

        return NextResponse.json(
            { 
                data: updatedApplicationCategory,
                msg: 'Application Category Updated',
                code: 200 
            }, 
            { status: 200 }
        )
    } catch (error) {
        console.error('PUT /api/categories error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update application category',
                error: String(error),
            },
            { status: 500 }
        )
    }
}