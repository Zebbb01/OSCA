// app/api/benefits/route.ts
import { benefitFormSchema } from '@/schema/benefit/benefit.schema'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const parsed = benefitFormSchema.parse(body)

        const { name, description, tag, requirements } = parsed

        await prisma.benefits.create({
            data: {
                name: name,
                description: description,
                tag: tag,
                benefit_requirements: {
                    create: requirements.map((req) => ({
                        name: req.name,
                    })),
                },
            },
        })

        return NextResponse.json({ msg: 'Benefit Added Successfully', code: 201 }, { status: 201 })
    } catch (error: any) {
        console.error('[CREATE_BENEFIT_ERROR]', error)
        return NextResponse.json({ msg: error.message, code: 500 }, { status: 500 })
    }
}

export async function GET(request: NextRequest) { // <<< IMPORTANT: Add 'request: NextRequest' here
    try {
        const url = new URL(request.url);
        const benefitId = url.searchParams.get('benefit_id'); // <<< Get the benefit_id from the URL

        if (benefitId) {
            // If benefit_id is provided, fetch only that specific benefit's requirements
            const benefit = await prisma.benefits.findUnique({
                where: {
                    id: parseInt(benefitId),
                },
                select: {
                    benefit_requirements: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            if (benefit) {
                // Return only the benefit_requirements array for the specific benefit
                return NextResponse.json(benefit.benefit_requirements, { status: 200 });
            } else {
                // If benefit with ID not found, return empty array of requirements
                return NextResponse.json([], { status: 200 });
            }
        } else {
            // If no benefit_id is provided, return all benefits (original behavior)
            const benefits = await prisma.benefits.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    tag: true,
                    benefit_requirements: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return NextResponse.json(benefits, { status: 200 });
        }
    } catch (error: any) {
        console.error('[FETCH_BENEFITS_ERROR]', error);
        return NextResponse.json({ msg: 'Failed to fetch benefits', code: 500 }, { status: 500 });
    }
}