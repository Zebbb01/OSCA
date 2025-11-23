// app/api/notifications/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for validating mark as read request
const markAsReadSchema = z.object({
  userId: z.string(),
  notificationId: z.string().optional(),
  notificationIds: z.array(z.string()).optional(),
});

// GET: Fetch notification read status for a specific user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const statuses = await prisma.notificationStatus.findMany({
      where: { userId },
      select: {
        notificationId: true,
        isRead: true,
        readAt: true,
      },
    });

    // Convert to a map for easier lookup
    const statusMap = statuses.reduce((acc, status) => {
      acc[status.notificationId] = {
        isRead: status.isRead,
        readAt: status.readAt,
      };
      return acc;
    }, {} as Record<string, { isRead: boolean; readAt: Date | null }>);

    return NextResponse.json(statusMap, { status: 200 });
  } catch (error: any) {
    console.error('[GET_NOTIFICATION_STATUS_ERROR]', error);
    return NextResponse.json(
      {
        msg: error.message || 'Failed to fetch notification status',
        code: 500,
      },
      { status: 500 }
    );
  }
}

// POST: Mark notification(s) as read
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const parsed = markAsReadSchema.parse(body);
    const { userId, notificationId, notificationIds } = parsed;

    // Handle single or multiple notifications
    const idsToMark = notificationIds || (notificationId ? [notificationId] : []);

    if (idsToMark.length === 0) {
      return NextResponse.json(
        { msg: 'No notification IDs provided', code: 400 },
        { status: 400 }
      );
    }

    // Use upsert to create or update
    const operations = idsToMark.map((id: string) =>
      prisma.notificationStatus.upsert({
        where: {
          userId_notificationId: {
            userId,
            notificationId: id,
          },
        },
        create: {
          userId,
          notificationId: id,
          isRead: true,
          readAt: new Date(),
        },
        update: {
          isRead: true,
          readAt: new Date(),
        },
      })
    );

    const results = await prisma.$transaction(operations);

    return NextResponse.json(
      { success: true, marked: results.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[MARK_NOTIFICATION_READ_ERROR]', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          msg: 'Validation error',
          errors: error.errors,
          code: 400,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        msg: error.message || 'Failed to mark notification as read',
        code: 500,
      },
      { status: 500 }
    );
  }
}

// PUT: Mark all notifications as read for a user
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { msg: 'User ID is required', code: 400 },
        { status: 400 }
      );
    }

    // Get all current notification IDs that need to be marked
    const seniors = await prisma.senior.findMany({
      where: {
        OR: [
          { remarks: { name: 'Pending' } },
          { releasedAt: { not: null } },
        ],
      },
      select: { id: true, remarks: true, releasedAt: true },
    });

    const notificationIds: string[] = [];
    
    seniors.forEach((senior) => {
      if (senior.remarks.name === 'Pending') {
        notificationIds.push(`pending-${senior.id}`);
      }
      if (senior.releasedAt) {
        notificationIds.push(`released-${senior.id}`);
      }
    });

    if (notificationIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          msg: 'No notifications to mark as read',
          count: 0,
        },
        { status: 200 }
      );
    }

    // Use upsert for each notification to ensure they exist
    const operations = notificationIds.map((notifId) =>
      prisma.notificationStatus.upsert({
        where: {
          userId_notificationId: {
            userId,
            notificationId: notifId,
          },
        },
        create: {
          userId,
          notificationId: notifId,
          isRead: true,
          readAt: new Date(),
        },
        update: {
          isRead: true,
          readAt: new Date(),
        },
      })
    );

    const results = await prisma.$transaction(operations);

    return NextResponse.json(
      {
        success: true,
        msg: 'All notifications marked as read',
        count: results.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[MARK_ALL_NOTIFICATIONS_READ_ERROR]', error);
    return NextResponse.json(
      {
        msg: error.message || 'Failed to mark all notifications as read',
        code: 500,
      },
      { status: 500 }
    );
  }
}