import { apiSlice, type AppResponse } from './apiSlice';
import { Bank, BankAccountDetail } from '@/types';

export const bankApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBanks: builder.query<AppResponse<Bank[]>, void>({
            query: () => 'banks',
            providesTags: ['Withdrawal'],
        }),
        resolveAccount: builder.mutation<AppResponse<BankAccountDetail>, { bank_code: string; account_number: string }>({
            query: (body) => ({
                url: 'banks/resolve',
                method: 'POST',
                body,
            }),
        }),
        getUserBank: builder.query<AppResponse<Bank>, void>({
            query: () => 'banks/user',
        }),
    }),
});

export const { useGetBanksQuery, useResolveAccountMutation, useGetUserBankQuery } = bankApi;
