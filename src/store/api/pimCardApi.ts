import { apiSlice, type AppResponse } from './apiSlice';
import type { PaginatedResult } from '@/types';

export interface PimCard {
    id: string;
    code: string;
    amount: number;
    pricePerUser: number;
    userId: string;
    proofOfPayment: string;
    status: number;
    rejectionReason: string | null;
    approvedBy: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        usersWithCard: number;
    };
}

export interface PimCardsSummary {
    totalCards: number;
    availableSlots: number;
    usedSlots: number;
    totalSlots: number;
    pendingCards: number;
    price: number;
    activeCard: {
        id: string;
        code: string;
        amount: number;
        pricePerUser: number;
        createdAt: string;
        slots: number;
    } | null;
    status: {
        PENDING: number;
        APPROVED: number;
        CANCELLED: number;
    };
}

export interface PaymentAccountDetail {
    account_name: string;
    bank_name: string;
    account_number: string;
    bank_uuid?: string;
    expiry_date: string;
    amount: number;
    reference: string;
}

export const pimCardApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPimCards: builder.query<AppResponse<PaginatedResult<PimCard>>, { page?: number; limit?: number; status?: number }>({
            query: (params) => ({
                url: 'pim_cards',
                params,
            }),
            providesTags: ['Wallet'], // Using Wallet tag for a start as it's often related to transactions
        }),
        getPimCardsSummary: builder.query<AppResponse<PimCardsSummary>, void>({
            query: () => 'pim_cards/summary',
            providesTags: ['Wallet'],
        }),
        purchasePimCard: builder.mutation<AppResponse<{ account_detail: PaymentAccountDetail }>, { quantity: number; amount: number }>({
            query: (body) => ({
                url: 'pim_cards',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        verifyCardPurchasePayment: builder.mutation<AppResponse<void>, { reference: string }>({
            query: (body) => ({
                url: 'pim_cards/verify-payment',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet'],
        }),
    }),
});

export const {
    useGetPimCardsQuery,
    useGetPimCardsSummaryQuery,
    usePurchasePimCardMutation,
    useVerifyCardPurchasePaymentMutation,
} = pimCardApi;
