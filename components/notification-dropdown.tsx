// components/notification-dropdown.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { BellRing } from 'lucide-react'
import { CheckCircle2, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query'; // Import useQuery for data fetching

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateTime } from '@/utils/format'
import { Seniors } from '@/types/seniors'; // Import the new Notification type and Seniors type
import { Notification } from '@/types/notification'; // Assuming you have a Notification type defined

export function NotificationDropdown({ userRole }: { userRole: 'ADMIN' | 'USER' }) {
    // --- REAL DATA FETCHING (Conceptual Example) ---
    const fetchNotifications = async (): Promise<Notification[]> => {
        try {
            // Replace with your actual API endpoint for fetching seniors
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const seniorsData: Seniors[] = await response.json();

            const generatedNotifications: Notification[] = seniorsData.flatMap(senior => {
                const notifications: Notification[] = [];

                // Notification for pending seniors
                if (senior.remarks.name === 'Pending') {
                    notifications.push({
                        id: `pending-${senior.id}`,
                        type: 'senior_pending',
                        message: `New senior **${senior.firstname} ${senior.lastname}** pending verification.`,
                        // Ensure your backend sends dates in a format that new Date() can parse
                        timestamp: new Date(senior.createdAt).toISOString(),
                        link: `/admin/senior-citizen/record?filter=pending&seniorId=${senior.id}`,
                        seniorId: senior.id,
                        seniorName: `${senior.firstname} ${senior.lastname}`,
                    });
                }

                // Notification for recently released seniors
                // Check if releasedAt exists and is a valid date
                if (senior.releasedAt) {
                    notifications.push({
                        id: `released-${senior.id}`,
                        type: 'release_approved',
                        message: `Benefits released for **${senior.firstname} ${senior.lastname}**!`,
                        // Ensure your backend sends dates in a format that new Date() can parse
                        timestamp: new Date(senior.releasedAt).toISOString(),
                        link: `/admin/applications/release-monitoring?status=released&seniorId=${senior.id}`,
                        seniorId: senior.id,
                        seniorName: `${senior.firstname} ${senior.lastname}`,
                    });
                }
                return notifications;
            }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            return generatedNotifications;

        } catch (err) {
            console.error("Failed to fetch seniors for notifications:", err);
            // You might want to rethrow or return an empty array based on error handling strategy
            throw err;
        }
    };

    const { data: notifications, isLoading, error } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 60 * 1000,
    });

    // Calculate pending seniors count
    const pendingSeniorsCount = notifications?.filter(
        (notif) => notif.type === 'senior_pending'
    ).length || 0;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'release_approved':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'senior_pending':
                return <UserPlus className="h-4 w-4 text-blue-500" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 hover:text-white" disabled>
                <BellRing className="h-5 w-5 animate-pulse" />
                <span className="sr-only">Loading Notifications...</span>
            </Button>
        );
    }

    if (error) {
        // Handle error gracefully, maybe show a tooltip or a different icon
        console.error("Error fetching notifications:", error);
        return (
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 hover:text-white" title="Error loading notifications">
                <BellRing className="h-5 w-5 text-red-400" />
                <span className="sr-only">Error loading notifications</span>
            </Button>
        );
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 hover:text-white">
                    <BellRing className="h-5 w-5" />
                    {pendingSeniorsCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {pendingSeniorsCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[350px] p-0" align="end" forceMount>
                <DropdownMenuLabel className="font-semibold text-lg p-3 border-b">Notifications</DropdownMenuLabel>
                <ScrollArea className="h-[300px]">
                    <DropdownMenuGroup>
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <DropdownMenuItem key={notification.id} asChild>
                                    {/* The Link component must be the direct child of DropdownMenuItem when asChild is used */}
                                    <Link
                                        href={notification.link}
                                        className="flex items-start gap-3 p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-200"
                                    >
                                        <div className="flex-shrink-0 pt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <div
                                                className="font-medium text-sm leading-tight"
                                                dangerouslySetInnerHTML={{ __html: notification.message }}
                                            />
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {formatDateTime(notification.timestamp)}
                                            </div>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem className="py-4 text-center text-muted-foreground justify-center">
                                No new notifications.
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    {userRole === 'USER' ? (
                        <Link href="/staff/applications/release-monitoring" className="block text-center text-sm p-2 text-primary hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            View All Notifications
                        </Link>
                    ) : (
                        <Link href="/admin/applications/release-monitoring" className="block text-center text-sm p-2 text-primary hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            View All Notifications
                        </Link>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}