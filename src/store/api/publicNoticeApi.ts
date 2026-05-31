import { apiSlice, type AppResponse } from './apiSlice';

export interface PublicNotice {
    id: string;
    title: string;
    text: string;
    createdAt: string;
}

export const publicNoticeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getActiveNotice: builder.query<AppResponse<PublicNotice | null>, void>({
            query: () => 'public-notices',
        }),
    }),
});

export const { useGetActiveNoticeQuery } = publicNoticeApi;
