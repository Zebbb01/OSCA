// app/api/benefits/application/route.ts
import { benefitApplicationSchema } from '@/schema/benefit/benefit.schema';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { uploadAndSaveDocument } from '@/app/api/seniors/services/helpers.service';

export async function POST(request: NextRequest) {
  try {
    // Parse FormData instead of JSON to handle file uploads
    const formData = await request.formData();
    
    // Extract the basic application data
    const benefit_id = parseInt(formData.get('benefit_id') as string);
    const selected_senior_ids = JSON.parse(formData.get('selected_senior_ids') as string);
    
    // Validate the basic data
    const parsed = benefitApplicationSchema.parse({
      benefit_id,
      selected_senior_ids,
      status: 'pending'
    });

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

    // Create applications for each selected senior
    const applicationsData = selected_senior_ids.map((senior_id: number) => {
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

    const createdApplications = await prisma.applications.createMany({
      data: applicationsData,
    });

    // Handle document uploads for each requirement
    const uploadPromises: Promise<any>[] = [];
    
    // Process requirement documents for each senior
    for (const senior_id of selected_senior_ids) {
      for (const [key, value] of formData.entries()) {
        if (key.startsWith(`requirement_${senior_id}_`) && value instanceof File) {
          // Extract requirement ID from key format: requirement_<senior_id>_<requirement_id>
          const parts = key.split('_');
          const requirementId = parseInt(parts[2]);
          
          uploadPromises.push(
            uploadAndSaveDocument(
              value as File, 
              senior_id, 
              'medical_assistance', 
              'medical_assistance', 
              requirementId
            )
          );
        }
      }
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      const uploadResults = await Promise.allSettled(uploadPromises);
      const failedUploads = uploadResults.filter(result => result.status === 'rejected');
      
      if (failedUploads.length > 0) {
        console.error('Some document uploads failed:', failedUploads);
        // Continue anyway - the application is created, just some docs failed
      }
    }
    
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
    const name = searchParams.get('name');
    const appliedBenefit = searchParams.get('applied_benefit');
    const seniorCategory = searchParams.get('senior_category');
    const status = searchParams.get('status');

    // Initialize a Prisma 'where' clause object
    let whereClause: any = {};

    // Apply filters based on presence and value of query parameters
    if (name) {
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
      where: whereClause,
      include: {
        senior: {
          select: {
            firstname: true,
            middlename: true,
            lastname: true,
            email: true,
            pwd: true,
            documents: {
              // Get all documents, not just medical_assistance
              include: {
                benefitRequirement: {
                  select: {
                    id: true,
                    name: true,
                    benefit: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
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