import { apiSlice, type AppResponse } from './apiSlice';
import type { Wallet, WalletTransfer, PaginatedResult, Loan } from '@/types';

export const walletApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWallets: builder.query<AppResponse<Wallet[]>, void>({
            query: () => 'wallet',
            providesTags: ['Wallet', 'User'],
        }),
        getTransfers: builder.query<AppResponse<PaginatedResult<WalletTransfer>>, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => ({
                url: 'wallet/transfers',
                params: { page, limit, search },
            }),
            providesTags: ['Wallet'],
        }),
        transfer: builder.mutation<AppResponse<WalletTransfer>, { receiverTransferId: string; senderWalletId: string; amount: number; pin: string }>({
            query: (body) => ({
                url: 'wallet/transfer',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        getGkwthPrices: builder.query<AppResponse<{ loanPurchasePrice: string; gkwthSalePrice: string; gkwthPurchasePrice: string }>, void>({
            query: () => 'wallet/gkwth/prices',
        }),
        purchaseGkwth: builder.mutation<AppResponse<{ account_detail: { account_name: string; bank_name: string; account_number: string; amount: number; expiry_date: string; reference: string } }>, { quantity: number }>({
            query: (body) => ({
                url: 'payment/gkwth/purchase',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Wallet'],
        }),
        requestAssetLoan: builder.mutation<AppResponse<Loan>, { quantity: number }>({
            query: (body) => ({
                url: 'payment/gkwth/loan-request',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Loan', 'Wallet'],
        }),
        getAssetLoans: builder.query<AppResponse<PaginatedResult<Loan>>, { page?: number; limit?: number } | void>({
            query: (params) => ({
                url: 'payment/gkwth/loans',
                params: params || undefined,
            }),
            providesTags: ['Loan'],
        }),
    }),
});

export const { 
    useGetWalletsQuery, 
    useGetTransfersQuery, 
    useTransferMutation, 
    useGetGkwthPricesQuery, 
    usePurchaseGkwthMutation,
    useRequestAssetLoanMutation,
    useGetAssetLoansQuery
} = walletApi;
