import { apiSlice, type AppResponse } from './apiSlice';

export interface AdminNotice {
    id: string;
    title: string;
    body: string;
    createdAt: string;
}

export const adminNoticeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminNotices: builder.query<AppResponse<{ notices: AdminNotice[] }>, void>({
            query: () => 'admin-notices',
            providesTags: ['AdminNotice'],
        }),
    }),
});

export const { useGetAdminNoticesQuery } = adminNoticeApi;
