// app\api\benefits\application\route.ts:
import { benefitApplicationSchema } from '@/schema/benefit/benefit.schema'
import prisma from '@/prisma/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const parsed = benefitApplicationSchema.parse(body)
        const { benefit_id, selected_senior_ids, status } = parsed // <-- Destructure 'status' from parsed data

        // --- NEW LOGIC: Get the ID for 'PENDING' status ---
        const pendingStatus = await prisma.status.findUnique({
            where: {
                name: 'PENDING',
            },
            select: {
                id: true,
            },
        })

        if (!pendingStatus) {
            // This should ideally not happen if your database is seeded correctly
            console.error("Error: 'PENDING' status not found in the database. Please ensure it exists.");
            return NextResponse.json(
                { msg: 'Server configuration error: PENDING status not found.', code: 500 },
                { status: 500 }
            )
        }

        const pendingStatusId = pendingStatus.id; // This will be 2 based on your Status table

        // --- END NEW LOGIC ---

        const applicationsData = selected_senior_ids.map((senior_id) => ({
            benefit_id,
            senior_id,
            status_id: pendingStatusId, // <-- Use the dynamically fetched PENDING status ID here
            category_id: null, // DEFAULT CATEGORY TO AVOID NULL BUT LATER ON GETS UPDATED
        }))

        await prisma.applications.createMany({
            data: applicationsData,
        })

        return NextResponse.json({ msg: 'Benefit Application Success', code: 201 }, { status: 201 })
    } catch (error: any) {
        console.error('[CREATE_BENEFIT_ERROR]', error)
        return NextResponse.json({ msg: error.message, code: 500 }, { status: 500 })
    }
}

export async function GET() {
    try {
        const applications = await prisma.applications.findMany({
            include: {
                senior: {
                    include: {
                        documents: true, // <--- Add this line!
                    },
                },
                benefit: {
                    select: {
                        id: true,
                        name: true,
                        benefit_requirements: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                status: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(applications, { status: 200 })
    } catch (error: any) {
        console.error('[GET /api/applications]', error)
        return NextResponse.json({ msg: error.message, code: 500 }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const applicationId = url.searchParams.get('application_id')

        if (!applicationId) {
            return NextResponse.json({ msg: 'Application ID is required', code: 400 }, { status: 400 })
        }

        await prisma.applications.delete({
            where: {
                id: parseInt(applicationId),
            },
        })

        return NextResponse.json({ msg: 'Application deleted successfully', code: 200 }, { status: 200 })
    } catch (error: any) {
        console.error('[DELETE /api/benefits/application]', error)
        return NextResponse.json({ msg: 'Error deleting application', code: 500 }, { status: 500 })
    }
}