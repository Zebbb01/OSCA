// hooks/use-notifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Notification, NotificationStatusMap } from '@/types/notification';
import { Seniors } from '@/types/seniors';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // Fetch all seniors to generate notifications
  const { data: seniorsData } = useQuery<Seniors[]>({
    queryKey: ['seniors'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`);
      if (!response.ok) throw new Error('Failed to fetch seniors');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Fetch notification read status
  const { data: notificationStatus } = useQuery<NotificationStatusMap>({
    queryKey: ['notificationStatus', userId],
    queryFn: async () => {
      if (!userId) return {};
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/status?userId=${userId}`
      );
      if (!response.ok) throw new Error('Failed to fetch notification status');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Generate notifications from seniors data
  const notifications: Notification[] = seniorsData
    ? seniorsData
        .flatMap((senior) => {
          const notifications: Notification[] = [];

          // Pending notifications
          if (senior.remarks.name === 'Pending') {
            const notifId = `pending-${senior.id}`;
            const status = notificationStatus?.[notifId];
            
            notifications.push({
              id: notifId,
              type: 'senior_pending',
              message: `New senior <strong>${senior.firstname} ${senior.lastname}</strong> pending verification.`,
              timestamp: new Date(senior.createdAt).toISOString(),
              link: `/admin/record?filter=pending&seniorId=${senior.id}`,
              seniorId: senior.id,
              seniorName: `${senior.firstname} ${senior.lastname}`,
              isRead: status?.isRead || false,
              readAt: status?.readAt?.toString() || null,
            });
          }

          // Released notifications
          if (senior.releasedAt) {
            const notifId = `released-${senior.id}`;
            const status = notificationStatus?.[notifId];
            
            notifications.push({
              id: notifId,
              type: 'release_approved',
              message: `Benefits released for <strong>${senior.firstname} ${senior.lastname}</strong>!`,
              timestamp: new Date(senior.releasedAt).toISOString(),
              link: `/admin/released-monitoring?status=released&seniorId=${senior.id}`,
              seniorId: senior.id,
              seniorName: `${senior.firstname} ${senior.lastname}`,
              isRead: status?.isRead || false,
              readAt: status?.readAt?.toString() || null,
            });
          }

          return notifications;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) throw new Error('User not authenticated');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, notificationId }),
        }
      );
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationStatus', userId] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || 'Failed to mark all as read');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Mark all as read success:', data);
      queryClient.invalidateQueries({ queryKey: ['notificationStatus', userId] });
    },
    onError: (error) => {
      console.error('Mark all as read error:', error);
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isLoading: !seniorsData || (userId && !notificationStatus),
  };
}