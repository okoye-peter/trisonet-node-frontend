import { apiSlice, type AppResponse } from './apiSlice';
import type { AuctionListing, AuctionBid, AuctionTransaction, AuctionSettings, AuctionClaimResponse, MyAuctionsResponse, MyBidHistoryResponse, PaginatedResult } from '@/types';

export const auctionApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAuctionSettings: builder.query<AppResponse<AuctionSettings>, void>({
            query: () => 'auctions/settings',
        }),
        getAuctions: builder.query<AppResponse<PaginatedResult<AuctionListing>>, { page?: number; limit?: number; status?: string; search?: string; sort?: string } | void>({
            query: (params) => ({
                url: 'auctions',
                params: params || undefined,
            }),
            providesTags: ['Auction'],
        }),
        getAuction: builder.query<AppResponse<AuctionListing>, string>({
            query: (id) => `auctions/${id}`,
            providesTags: (result, error, id) => [{ type: 'Auction', id }],
        }),
        getMyAuctions: builder.query<AppResponse<MyAuctionsResponse>, void>({
            query: () => 'auctions/mine',
            providesTags: ['Auction'],
        }),
        getMyBidHistory: builder.query<AppResponse<MyBidHistoryResponse>, { page?: number; limit?: number; result?: 'active' | 'pending' | 'awaiting_payment' | 'won' | 'lost' } | void>({
            query: (params) => ({
                url: 'auctions/my-bids',
                params: params || undefined,
            }),
            providesTags: ['Auction'],
        }),
        getAuctionTransaction: builder.query<AppResponse<AuctionTransaction>, string>({
            query: (id) => `auctions/${id}/transaction`,
            providesTags: (result, error, id) => [{ type: 'Auction', id }],
        }),
        createAuction: builder.mutation<AppResponse<AuctionListing>, {
            gkwthAmount: number;
            startingBid: number;
            buyItNowPrice?: number;
            minIncrement?: number;
            durationHours: number;
            visibility?: 'public' | 'followers' | 'private';
        }>({
            query: (body) => ({ url: 'auctions', method: 'POST', body }),
            invalidatesTags: ['Auction', 'Wallet'],
        }),
        placeBid: builder.mutation<AppResponse<AuctionBid>, { id: string; amount: number }>({
            query: ({ id, amount }) => ({ url: `auctions/${id}/bids`, method: 'POST', body: { amount } }),
            invalidatesTags: (result, error, arg) => [{ type: 'Auction', id: arg.id }, 'Auction', 'Wallet'],
        }),
        buyItNow: builder.mutation<AppResponse<{ listing: AuctionListing; winningBid: AuctionBid; claimDeadlineAt: string }>, string>({
            query: (id) => ({ url: `auctions/${id}/buy-now`, method: 'POST' }),
            invalidatesTags: (result, error, id) => [{ type: 'Auction', id }, 'Auction'],
        }),
        acceptBid: builder.mutation<AppResponse<{ listing: AuctionListing; winningBid: AuctionBid; claimDeadlineAt: string }>, { id: string; bidId: string }>({
            query: ({ id, bidId }) => ({ url: `auctions/${id}/bids/${bidId}/accept`, method: 'POST' }),
            invalidatesTags: (result, error, arg) => [{ type: 'Auction', id: arg.id }, 'Auction'],
        }),
        rejectBid: builder.mutation<AppResponse<AuctionBid>, { id: string; bidId: string }>({
            query: ({ id, bidId }) => ({ url: `auctions/${id}/bids/${bidId}/reject`, method: 'POST' }),
            invalidatesTags: (result, error, arg) => [{ type: 'Auction', id: arg.id }, 'Auction'],
        }),
        claimAuction: builder.mutation<AppResponse<AuctionClaimResponse>, string>({
            query: (id) => ({ url: `auctions/${id}/claim`, method: 'POST' }),
            invalidatesTags: (result, error, id) => [{ type: 'Auction', id }, 'Auction'],
        }),
        endEarly: builder.mutation<AppResponse<AuctionListing>, string>({
            query: (id) => ({ url: `auctions/${id}/end-early`, method: 'POST' }),
            invalidatesTags: (result, error, id) => [{ type: 'Auction', id }, 'Auction', 'Wallet'],
        }),
        submitReview: builder.mutation<AppResponse<unknown>, { id: string; rating: number; comment?: string }>({
            query: ({ id, ...body }) => ({ url: `auctions/${id}/review`, method: 'POST', body }),
            invalidatesTags: (result, error, arg) => [{ type: 'Auction', id: arg.id }],
        }),
    }),
});

export const {
    useGetAuctionSettingsQuery,
    useGetAuctionsQuery,
    useGetAuctionQuery,
    useGetMyAuctionsQuery,
    useGetMyBidHistoryQuery,
    useGetAuctionTransactionQuery,
    useCreateAuctionMutation,
    usePlaceBidMutation,
    useBuyItNowMutation,
    useAcceptBidMutation,
    useRejectBidMutation,
    useClaimAuctionMutation,
    useEndEarlyMutation,
    useSubmitReviewMutation,
} = auctionApi;
