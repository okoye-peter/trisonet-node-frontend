import { apiSlice, type AppResponse } from './apiSlice';
import type { MySellerStore, PaginatedResult, SellerOrder, SellerOrderList, SellerOrderStatus, SellerProduct, SellerProductInput, SellerProductStatus, SellerStore, SellerStoreFields, UploadedFile } from '@/types';

export const sellerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMySellerStore: builder.query<AppResponse<MySellerStore>, void>({
            query: () => 'seller/store',
            providesTags: ['SellerStore'],
        }),
        saveMySellerStore: builder.mutation<AppResponse<SellerStore>, SellerStoreFields>({
            query: (body) => ({
                url: 'seller/store',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['SellerStore'],
        }),
        discardSellerStoreChanges: builder.mutation<AppResponse<SellerStore>, void>({
            query: () => ({
                url: 'seller/store/pending-changes',
                method: 'DELETE',
            }),
            invalidatesTags: ['SellerStore'],
        }),
        getMySellerProducts: builder.query<AppResponse<PaginatedResult<SellerProduct>>, { page?: number; limit?: number; status?: SellerProductStatus; search?: string } | void>({
            query: (params) => ({ url: 'seller/products', params: params ?? undefined }),
            providesTags: ['SellerProduct'],
        }),
        getMySellerProduct: builder.query<AppResponse<SellerProduct>, string>({
            query: (id) => `seller/products/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'SellerProduct', id }],
        }),
        createSellerProduct: builder.mutation<AppResponse<SellerProduct>, SellerProductInput>({
            query: (body) => ({ url: 'seller/products', method: 'POST', body }),
            invalidatesTags: ['SellerProduct'],
        }),
        updateSellerProduct: builder.mutation<AppResponse<{ product: SellerProduct; sentForReview: boolean }>, { id: string; body: SellerProductInput }>({
            query: ({ id, body }) => ({ url: `seller/products/${id}`, method: 'PUT', body }),
            invalidatesTags: ['SellerProduct'],
        }),
        deleteSellerProduct: builder.mutation<AppResponse<null>, string>({
            query: (id) => ({ url: `seller/products/${id}`, method: 'DELETE' }),
            invalidatesTags: ['SellerProduct'],
        }),
        getMySellerOrders: builder.query<AppResponse<SellerOrderList>, { page?: number; limit?: number; status?: SellerOrderStatus; search?: string } | void>({
            query: (params) => ({ url: 'seller/orders', params: params ?? undefined }),
            providesTags: ['SellerOrder'],
        }),
        getMySellerOrder: builder.query<AppResponse<SellerOrder>, string>({
            query: (refNo) => `seller/orders/${encodeURIComponent(refNo)}`,
            providesTags: (_result, _error, refNo) => [{ type: 'SellerOrder', id: refNo }],
        }),
        updateSellerOrderStatus: builder.mutation<AppResponse<SellerOrder>, { refNo: string; courierName: string; courierPhone: string }>({
            query: ({ refNo, courierName, courierPhone }) => ({
                url: `seller/orders/${encodeURIComponent(refNo)}/status`,
                method: 'PATCH',
                body: { status: 'shipped', courierName, courierPhone },
            }),
            invalidatesTags: ['SellerOrder'],
        }),
        uploadSellerImage: builder.mutation<AppResponse<UploadedFile>, File>({
            query: (file) => {
                const body = new FormData();
                body.append('file', file);
                return { url: 'uploads', method: 'POST', body };
            },
        }),
    }),
});

export const {
    useGetMySellerStoreQuery,
    useSaveMySellerStoreMutation,
    useDiscardSellerStoreChangesMutation,
    useUploadSellerImageMutation,
    useGetMySellerProductsQuery,
    useGetMySellerProductQuery,
    useCreateSellerProductMutation,
    useUpdateSellerProductMutation,
    useDeleteSellerProductMutation,
    useGetMySellerOrdersQuery,
    useGetMySellerOrderQuery,
    useUpdateSellerOrderStatusMutation,
} = sellerApi;
