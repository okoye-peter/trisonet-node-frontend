import { apiSlice, type AppResponse } from './apiSlice';
import { Bank, BankAccountDetail } from '@/types';

export const bankApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBanks: builder.query<AppResponse<Bank[]>, void>({
            query: () => 'banks',
            transformResponse: (response: AppResponse<{ success: boolean; data: { banks: Bank[] } }>) => {
                if (response.data?.success && response.data?.data?.banks) {
                    return {
                        ...response,
                        data: response.data.data.banks
                    } as AppResponse<Bank[]>;
                }
                return response as unknown as AppResponse<Bank[]>;
            },
            providesTags: ['Withdrawal'],
        }),
        resolveAccount: builder.mutation<AppResponse<BankAccountDetail>, { bankUUID: string; accountNumber: string }>({
            query: (body) => ({
                url: 'banks/resolve',
                method: 'POST',
                body,
            }),
        }),
        getUserBank: builder.query<AppResponse<BankAccountDetail>, void>({
            query: () => 'banks/user',
            transformResponse: (response: AppResponse<{ success: boolean; data: BankAccountDetail }>) => {
                if (response.data?.success && response.data?.data) {
                    return {
                        ...response,
                        data: response.data.data
                    } as AppResponse<BankAccountDetail>;
                }
                return response as unknown as AppResponse<BankAccountDetail>;
            },
        }),
    }),
});

export const { useGetBanksQuery, useResolveAccountMutation, useGetUserBankQuery } = bankApi;
