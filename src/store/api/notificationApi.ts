import { apiSlice, type AppResponse } from './apiSlice';

export interface Notification {
    id: string;
    title: string;
    body: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationData {
    notifications: Notification[];
    unreadCount: number;
}

export const notificationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<AppResponse<NotificationData>, { limit?: number; offset?: number }>({
            query: (params) => ({
                url: 'notifications',
                params,
            }),
            providesTags: ['Notification'],
        }),
        markNotificationRead: builder.mutation<AppResponse<void>, string>({
            query: (id) => ({
                url: `notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsRead: builder.mutation<AppResponse<void>, void>({
            query: () => ({
                url: 'notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const { 
    useGetNotificationsQuery, 
    useMarkNotificationReadMutation, 
    useMarkAllNotificationsReadMutation 
} = notificationApi;
