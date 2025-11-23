// components/notification-dropdown.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { BellRing, CheckCheck } from 'lucide-react'
import { CheckCircle2, UserPlus } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

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

export function NotificationDropdown({ userRole }: { userRole: 'ADMIN' | 'USER' }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

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

    const handleNotificationClick = (notificationId: string, isRead: boolean) => {
        console.log('Notification clicked:', { notificationId, isRead });
        
        // Only mark as read if it's unread
        if (!isRead) {
            markAsRead(notificationId);
        }
    };

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 hover:text-white">
                    <BellRing className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[350px] p-0" align="end" forceMount>
                <div className="flex items-center justify-between p-3 border-b">
                    <DropdownMenuLabel className="font-semibold text-lg p-0">
                        Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    <DropdownMenuGroup>
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <DropdownMenuItem key={notification.id} asChild>
                                    <Link
                                        href={
                                            notification.type === 'release_approved'
                                                ? userRole === 'USER'
                                                    ? `/staff/overview?tab=released&seniorId=${notification.seniorId}`
                                                    : `/admin/overview?tab=released&seniorId=${notification.seniorId}`
                                                : notification.link
                                        }
                                        onClick={() => handleNotificationClick(notification.id, notification.isRead || false)}
                                        className={cn(
                                            "flex items-start gap-3 p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-200",
                                            !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                                        )}
                                    >
                                        <div className="flex-shrink-0 pt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <div
                                                className={cn(
                                                    "text-sm leading-tight",
                                                    !notification.isRead && "font-semibold"
                                                )}
                                                dangerouslySetInnerHTML={{ __html: notification.message }}
                                            />
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {formatDateTime(notification.timestamp)}
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0 pt-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                        )}
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
                        <Link href="/staff/overview?tab=released" className="block text-center text-sm p-2 text-primary hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            View All 
                        </Link>
                    ) : (
                        <Link href="/admin/overview?tab=released" className="block text-center text-sm p-2 text-primary hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            View All 
                        </Link>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}