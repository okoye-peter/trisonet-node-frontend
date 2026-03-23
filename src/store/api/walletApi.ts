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
        generateWardSlotVirtualAccount: builder.mutation<AppResponse<{ account_detail: { account_name: string; bank_name: string; account_number: string; amount: number; expiry_date: string } }>, { type: 'limited' | 'unlimited'; quantity?: number }>({
            query: (body) => ({
                url: 'payment/wards/generate-virtual-account',
                method: 'POST',
                body,
            }),
        }),
        initiateDirectWalletFunding: builder.mutation<AppResponse<{ 
            reference: string; 
            amount: number; 
            publicKey: string; 
            email: string; 
            phone: string;
            account_detail: {
                account_name: string;
                bank_name: string;
                account_number: string;
                expiry_date: string;
            }
        }>, { amount: number }>({
            query: (body) => ({
                url: 'payment/wallet/direct/funding',
                method: 'POST',
                body,
            }),
        }),
        checkFundingStatus: builder.query<AppResponse<{ status: 'success' | 'pending' | 'failed' }>, string>({
            query: (reference) => `payment/wallet/check-status/${reference}`,
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
    useGetAssetLoansQuery,
    useGenerateWardSlotVirtualAccountMutation,
    useInitiateDirectWalletFundingMutation,
    useLazyCheckFundingStatusQuery,
    useCheckFundingStatusQuery
} = walletApi;
