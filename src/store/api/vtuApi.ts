import { apiSlice, type AppResponse } from './apiSlice';
import type { VtuDataResponse, BuyAirtimeRequest, BuyDataRequest, SubCableRequest } from '@/types';

export const vtuApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getVtuData: builder.query<VtuDataResponse, void>({
            query: () => '/vtu/data',
            providesTags: ['User'], // Wallets are updated after purchase
        }),
        buyAirtime: builder.mutation<AppResponse<void>, BuyAirtimeRequest>({
            query: (body) => ({
                url: '/vtu/buy-airtime',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        buyData: builder.mutation<AppResponse<void>, BuyDataRequest>({
            query: (body) => ({
                url: '/vtu/buy-data',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        subCable: builder.mutation<AppResponse<void>, SubCableRequest>({
            query: (body) => ({
                url: '/vtu/sub-cable',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const { 
    useGetVtuDataQuery, 
    useBuyAirtimeMutation, 
    useBuyDataMutation, 
    useSubCableMutation 
} = vtuApi;
