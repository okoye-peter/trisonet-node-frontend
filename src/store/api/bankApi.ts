import { apiSlice, type AppResponse } from './apiSlice';
import { Bank, BankAccountDetail } from '@/types';

export const bankApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBanks: builder.query<AppResponse<Bank[]>, void>({
            query: () => 'banks',
            transformResponse: (response: AppResponse<{ banks?: Bank[] } | Bank[]>) => {
                // Backend returns { status: 'success', data: { banks: [...] } }
                // or { status: 'success', data: [] } if service is down
                const data = response.data;
                if (data && !Array.isArray(data) && data.banks) {
                    return {
                        ...response,
                        data: data.banks
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
            transformResponse: (response: AppResponse<Partial<BankAccountDetail> | unknown[]>) => {
                // Backend returns { status: 'success', data: { ...details } }
                const data = response.data;
                if (data && !Array.isArray(data) && data.isValid !== undefined) {
                    return response as AppResponse<BankAccountDetail>;
                }
                // If it's an empty array or something else unexpected
                return response as unknown as AppResponse<BankAccountDetail>;
            },
        }),
    }),
});

export const { useGetBanksQuery, useResolveAccountMutation, useGetUserBankQuery } = bankApi;
