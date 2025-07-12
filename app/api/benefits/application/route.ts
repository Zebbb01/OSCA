// app\api\benefits\application\route.ts
import { benefitApplicationSchema } from '@/schema/benefit/benefit.schema';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = benefitApplicationSchema.parse(body);
        const { benefit_id, selected_senior_ids } = parsed; // Removed 'status' as it's not directly used for initial POST

        const pendingStatus = await prisma.status.findUnique({
            where: {
                name: 'PENDING',
            },
            select: {
                id: true,
            },
        });

        if (!pendingStatus) {
            console.error("Error: 'PENDING' status not found in the database. Please ensure it exists.");
            return NextResponse.json(
                { msg: 'Server configuration error: PENDING status not found.', code: 500 },
                { status: 500 }
            );
        }

        const pendingStatusId = pendingStatus.id;

        // Fetch both senior categories
        const categories = await prisma.seniorCategory.findMany({
            where: {
                name: {
                    in: ['Regular senior citizens', 'Special assistance cases'],
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const regularCategory = categories.find(cat => cat.name === 'Regular senior citizens');
        const specialAssistanceCategory = categories.find(cat => cat.name === 'Special assistance cases');

        if (!regularCategory || !specialAssistanceCategory) {
            console.error("Error: Required senior categories not found in the database.");
            return NextResponse.json(
                { msg: 'Server configuration error: Required senior categories not found.', code: 500 },
                { status: 500 }
            );
        }

        // Fetch senior details for all selected_senior_ids to get PWD status
        const seniors = await prisma.senior.findMany({
            where: {
                id: {
                    in: selected_senior_ids,
                },
            },
            select: {
                id: true,
                pwd: true,
            },
        });

        const applicationsData = selected_senior_ids.map((senior_id) => {
            const senior = seniors.find(s => s.id === senior_id);
            const isPwd = senior?.pwd === true;

            // Set category_id based on PWD status
            const category_id = isPwd ? specialAssistanceCategory.id : regularCategory.id;

            return {
                benefit_id,
                senior_id,
                status_id: pendingStatusId,
                category_id: category_id,
            };
        });

        await prisma.applications.createMany({
            data: applicationsData,
        });

        return NextResponse.json({ msg: 'Benefit Application Success', code: 201 }, { status: 201 });
    } catch (error: any) {
        console.error('[CREATE_BENEFIT_ERROR]', error);
        return NextResponse.json({ msg: error.message, code: 500 }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract query parameters
        const name = searchParams.get('name'); // For global filter (fullname)
        const appliedBenefit = searchParams.get('applied_benefit'); // Comma-separated for multi-select
        const seniorCategory = searchParams.get('senior_category'); // Comma-separated for multi-select
        const status = searchParams.get('status'); // Comma-separated for multi-select

        // Initialize a Prisma 'where' clause object
        let whereClause: any = {};

        // Apply filters based on presence and value of query parameters
        if (name) {
            // This assumes you want to search across first, middle, last name for the global filter
            whereClause.senior = {
                OR: [
                    { firstname: { contains: name, mode: 'insensitive' } },
                    { middlename: { contains: name, mode: 'insensitive' } },
                    { lastname: { contains: name, mode: 'insensitive' } },
                ],
            };
        }

        if (appliedBenefit) {
            const benefitNames = appliedBenefit.split(',');
            if (benefitNames.length > 0) {
                whereClause.benefit = {
                    name: {
                        in: benefitNames,
                    },
                };
            }
        }

        if (seniorCategory) {
            const categoryNames = seniorCategory.split(',');
            if (categoryNames.length > 0) {
                whereClause.category = {
                    name: {
                        in: categoryNames,
                    },
                };
            }
        }

        if (status) {
            const statusNames = status.split(',');
            if (statusNames.length > 0) {
                whereClause.status = {
                    name: {
                        in: statusNames,
                    },
                };
            }
        }

        const applications = await prisma.applications.findMany({
            where: whereClause, // Apply the constructed where clause
            include: {
                senior: {
                    select: {
                        firstname: true,
                        middlename: true,
                        lastname: true,
                        email: true,
                        pwd: true, // Include PWD field
                        documents: true,
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
        });

        return NextResponse.json(applications, { status: 200 });
    } catch (error: any) {
        console.error('[GET /api/applications]', error);
        return NextResponse.json({ msg: error.message, code: 500 }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const applicationId = url.searchParams.get('application_id');

        if (!applicationId) {
            return NextResponse.json({ msg: 'Application ID is required', code: 400 }, { status: 400 });
        }

        await prisma.applications.delete({
            where: {
                id: parseInt(applicationId),
            },
        });

        return NextResponse.json({ msg: 'Application deleted successfully', code: 200 }, { status: 200 });
    } catch (error: any) {
        console.error('[DELETE /api/benefits/application]', error);
        return NextResponse.json({ msg: 'Error deleting application', code: 500 }, { status: 500 });
    }
}