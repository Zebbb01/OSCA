// types/notification.ts
export interface Notification {
    id: string;
    type: 'senior_pending' | 'release_approved';
    message: string;
    timestamp: string; // ISO string
    link: string;
    seniorId?: number;
    seniorName?: string;
    isRead?: boolean; // NEW: Track read status
    readAt?: string | null; // NEW: When it was read
}

export interface NotificationStatusMap {
    [notificationId: string]: {
        isRead: boolean;
        readAt: Date | null;
    };
}