import { apiSlice, type AppResponse } from './apiSlice';

export interface PostUser {
    id: string;
    name: string;
    username: string;
    pictureUrl: string;
}

export interface Retweetable {
    id: string;
    status?: string;
    retweetMsg?: string;
    img?: string;
    user: PostUser;
}

export interface Post {
    id: string;
    userId: string;
    user: PostUser;
    status: string;
    img?: string;
    type: 'tweet' | 'retweet';
    retweetable?: Retweetable;
    totalComments: number;
    totalRetweets: number;
    totalLikes: number;
    isLiked: boolean;
    formattedDate: string;
    createdAt: string;
}

export interface PostsPaginated {
    data: Post[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export interface PostComment {
    id: string;
    comment: string;
    formattedDate: string;
    user: PostUser;
}

export interface PostDetail {
    post: Post;
    comments: PostComment[];
}

export const gistsZoneApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPost: builder.query<AppResponse<PostDetail>, { id: string; type: 'tweet' | 'retweet' }>({
            query: ({ id, type }) => ({
                url: `gists/${id}`,
                params: { type },
            }),
            providesTags: ['Post'],
        }),
        getPosts: builder.query<AppResponse<PostsPaginated>, { page?: number }>({
            query: ({ page = 1 } = {}) => ({
                url: 'gists',
                params: { page },
            }),
            providesTags: ['Post'],
        }),
        createPost: builder.mutation<AppResponse<Post>, FormData>({
            query: (formData) => ({
                url: 'gists',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Post'],
        }),
        toggleLike: builder.mutation<AppResponse<void>, { id: string; type: 'tweet' | 'retweet' }>({
            query: ({ id, type }) => ({
                url: `gists/${id}/like`,
                method: 'POST',
                params: { type },
            }),
            invalidatesTags: ['Post'],
        }),
        addComment: builder.mutation<AppResponse<void>, { id: string; type: 'tweet' | 'retweet'; comment: string }>({
            query: ({ id, type, comment }) => ({
                url: `gists/${id}/comment`,
                method: 'POST',
                body: { comment, tweet_type: type },
            }),
            invalidatesTags: ['Post'],
        }),
        retweetPost: builder.mutation<AppResponse<void>, { id: string; type: 'tweet' | 'retweet'; retweetMsg?: string }>({
            query: ({ id, type, retweetMsg }) => ({
                url: `gists/${id}/retweet`,
                method: 'POST',
                body: { retweet_msg: retweetMsg ?? '', tweet_type: type },
            }),
            invalidatesTags: ['Post'],
        }),
    }),
});

export const {
    useGetPostQuery,
    useGetPostsQuery,
    useCreatePostMutation,
    useToggleLikeMutation,
    useAddCommentMutation,
    useRetweetPostMutation,
} = gistsZoneApi;
