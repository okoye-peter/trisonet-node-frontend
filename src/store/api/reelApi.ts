import { apiSlice, type AppResponse } from './apiSlice';

export interface Reel {
    id: string;
    url: string;
    cloudinaryPublicId: string;
    fileType: 'image' | 'video';
    createdAt: string;
    updatedAt: string;
}

export interface ReelsPaginated {
    data: Reel[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export const reelApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getReels: builder.query<AppResponse<ReelsPaginated>, { page?: number; limit?: number } | void>({
            query: (params) => ({
                url: 'reels',
                params: params || undefined,
            }),
            providesTags: ['Chat'], // We can reuse or extend tag types if needed, but since it's just reads we can also omit or use a generic tag
        }),
    }),
});

export const { useGetReelsQuery } = reelApi;
