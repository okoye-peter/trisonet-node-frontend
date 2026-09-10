import { apiSlice, type AppResponse } from './apiSlice';
import type {
    StoreInviteCode,
    StoreInviteCommissionSummary,
    StoreGuestUpgradeRequest,
} from '@/types';

export const storeGuestApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getStoreInviteCode: builder.query<AppResponse<StoreInviteCode>, void>({
            query: () => 'store-guest/invite',
        }),
        getStoreInviteCommissionSummary: builder.query<AppResponse<StoreInviteCommissionSummary>, void>({
            query: () => 'store-guest/commission-summary',
        }),
        getStoreGuestUpgradeRequest: builder.query<AppResponse<StoreGuestUpgradeRequest | null>, void>({
            query: () => 'store-guest/upgrade-request',
            providesTags: ['StoreGuestUpgrade'],
        }),
        requestStoreGuestUpgrade: builder.mutation<AppResponse<StoreGuestUpgradeRequest>, void>({
            query: () => ({
                url: 'store-guest/upgrade-request',
                method: 'POST',
            }),
            invalidatesTags: ['StoreGuestUpgrade'],
        }),
    }),
});

export const {
    useGetStoreInviteCodeQuery,
    useGetStoreInviteCommissionSummaryQuery,
    useGetStoreGuestUpgradeRequestQuery,
    useRequestStoreGuestUpgradeMutation,
} = storeGuestApi;
