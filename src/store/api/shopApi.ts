import { apiSlice, type AppResponse } from './apiSlice';
import type {
    ShopProduct,
    ShopCategory,
    ShopOrder,
    CreateShopOrderPayload,
    PaginatedResult,
    ShopProductReview,
    ShopReviewSummary,
    ShopReviewableOrderItem,
} from '@/types';

interface CreateReviewPayload {
    orderItemId: string;
    rating: number;
    comment?: string;
}

export const shopApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getShopProducts: builder.query<AppResponse<PaginatedResult<ShopProduct>>, { page?: number; limit?: number; search?: string; categoryId?: string } | void>({
            query: (params) => ({
                url: 'products',
                params: params || undefined,
            }),
            providesTags: ['ShopProduct'],
        }),
        getShopProduct: builder.query<AppResponse<ShopProduct>, string>({
            query: (id) => `products/${id}`,
            providesTags: (result, error, id) => [{ type: 'ShopProduct', id }],
        }),
        getShopCategories: builder.query<AppResponse<ShopCategory[]>, void>({
            query: () => 'categories',
            providesTags: ['ShopCategory'],
        }),
        createShopOrder: builder.mutation<AppResponse<ShopOrder>, CreateShopOrderPayload>({
            query: (body) => ({
                url: 'orders',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ShopProduct', 'ShopOrder'],
        }),
        getShopOrder: builder.query<AppResponse<ShopOrder>, string>({
            query: (refNo) => `orders/${refNo}`,
            providesTags: (result, error, refNo) => [{ type: 'ShopOrder', id: refNo }],
        }),
        getShopOrders: builder.query<
            AppResponse<PaginatedResult<ShopOrder>>,
            {
                page?: number;
                limit?: number;
                search?: string;
                status?: 'pending' | 'shipped' | 'delivered' | 'cancelled';
                dateFrom?: string;
                dateTo?: string;
            } | void
        >({
            query: (params) => ({
                url: 'orders',
                params: params || undefined,
            }),
            providesTags: ['ShopOrder'],
        }),
        checkShopOrderStatus: builder.query<AppResponse<{ status: string }>, string>({
            query: (refNo) => `orders/${refNo}/status`,
        }),
        cancelShopOrder: builder.mutation<
            AppResponse<ShopOrder>,
            { refNo: string; bankName: string; bankUUID: string; accountNumber: string }
        >({
            query: ({ refNo, ...body }) => ({
                url: `orders/${refNo}/cancel`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { refNo }) => ['ShopProduct', { type: 'ShopOrder', id: refNo }, 'ShopOrder'],
        }),
        createShopReturn: builder.mutation<
            AppResponse<{ id: string; status: string; refundedAmount: number; reason: string; createdAt: string }>,
            { refNo: string; reason: string; orderItemIds: string[]; bankName: string; bankUUID: string; accountNumber: string }
        >({
            query: ({ refNo, ...body }) => ({
                url: `orders/${refNo}/return`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { refNo }) => [{ type: 'ShopOrder', id: refNo }, 'ShopOrder'],
        }),
        getProductReviews: builder.query<AppResponse<PaginatedResult<ShopProductReview> & { summary: ShopReviewSummary }>, { productId: string; page?: number; limit?: number }>({
            query: ({ productId, ...params }) => ({
                url: `products/${productId}/reviews`,
                params,
            }),
            providesTags: (result, error, { productId }) => [{ type: 'ProductReview', id: productId }],
        }),
        getReviewableOrderItems: builder.query<AppResponse<ShopReviewableOrderItem[]>, void>({
            query: () => 'reviews/reviewable',
            providesTags: ['ReviewableItem'],
        }),
        createReview: builder.mutation<AppResponse<ShopProductReview>, CreateReviewPayload>({
            query: (body) => ({
                url: 'reviews',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ReviewableItem', 'ShopProduct', 'ProductReview'],
        }),
    }),
});

export const {
    useGetShopProductsQuery,
    useGetShopProductQuery,
    useGetShopCategoriesQuery,
    useCancelShopOrderMutation,
    useCreateShopOrderMutation,
    useCreateShopReturnMutation,
    useGetShopOrderQuery,
    useGetShopOrdersQuery,
    useLazyCheckShopOrderStatusQuery,
    useGetProductReviewsQuery,
    useGetReviewableOrderItemsQuery,
    useCreateReviewMutation,
} = shopApi;
