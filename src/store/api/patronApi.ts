import { apiSlice, type AppResponse } from './apiSlice';
import type { 
    User, 
    PatronDashboardResponse, 
    PatronBeneficiariesResponse,
    PatronMembersResponse,
    PatronGroupTransaction,
    PagaVirtualAccountDetails,
    PatronPlanDetail,
    PatronTransactionsResponse
} from '@/types';

export interface PatronAdminLinkRow {
    id: string;
    code: string;
    active: boolean;
    type: 'group' | 'individual';
    name: string;
    patron: { id: string; name: string; email: string } | null;
    patronageBalance: number;
    /** the admin's remaining share this round (half of the round's slots, rounded down) */
    availableSlots: number;
    round: PatronAdminLinkRound;
    registered: number;
    earned: number;
}

export interface PatronAdminLinkRound {
    adminSlots: number;
    /** registrations the patron's own members still need to make before the link reopens */
    membersRemaining: number;
    status: 'open' | 'waiting_for_members' | 'needs_funding';
    walletSlots: number;
    roundSlots: number | null;
    adminQuota: number;
    adminUsed: number;
}

export interface PatronAdminLinksResponse {
    activationFee: number;
    totals: { availableSlots: number; registered: number; earned: number };
    links: PatronAdminLinkRow[];
}

export interface PatronAdminMemberInfo {
    isAdminMember: boolean;
    adminMember: {
        name: string;
        patronageBalance: number;
        activationFee: number;
        availableSlots: number;
        membersRemaining: number;
        roundStatus: PatronAdminLinkRound['status'];
    } | null;
}

export const patronApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPatronPlans: builder.query<AppResponse<PatronPlanDetail[]>, void>({
            query: () => 'patrons/plans',
        }),
        getPatronDashboard: builder.query<AppResponse<PatronDashboardResponse>, { page?: number } | void>({
            query: (params) => ({
                url: 'patrons/dashboard',
                params: params || {},
            }),
            providesTags: ['User', 'Wallet'],
        }),
        getPatronMembers: builder.query<AppResponse<PatronMembersResponse>, { page?: number; search?: string } | void>({
            query: (params) => ({
                url: 'patrons/members',
                params: params || {},
            }),
            providesTags: ['User'],
        }),
        getPatronGroupMembers: builder.query<AppResponse<PatronMembersResponse>, { page?: number; search?: string } | void>({
            query: (params) => ({
                url: 'patrons/group-members',
                params: params || {},
            }),
            providesTags: ['User'],
        }),
        getPatronBeneficiaries: builder.query<AppResponse<PatronBeneficiariesResponse>, { page?: number } | void>({
            query: (params) => ({
                url: 'patrons/beneficiaries',
                params: params || {},
            }),
            providesTags: ['User'],
        }),
        addPatronMember: builder.mutation<AppResponse<User>, { name: string; email: string; phone: string; password?: string; isCoPatron?: boolean }>({
            query: ({ isCoPatron, ...body }) => ({
                url: isCoPatron ? 'patrons/add-co-patron' : 'patrons/members',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        createPatronGroup: builder.mutation<AppResponse<void>, { name: string; amount: number; type: string; plan: string }>({
            query: (body) => ({
                url: 'patrons/create-group',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User', 'Wallet'],
        }),
        creditPatronMember: builder.mutation<AppResponse<PatronGroupTransaction>, { amount: number; member_id: string }>({
            query: (body) => ({
                url: 'patrons/credit-member',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        fundPatronGroup: builder.mutation<AppResponse<{ reference: string, amount: number, account_detail: PagaVirtualAccountDetails }>, { amount: number }>({
            query: (body) => ({
                url: 'patrons/fund-group',
                method: 'POST',
                body,
            }),
        }),
        checkPatronFundingStatus: builder.query<AppResponse<{ status: string }>, string>({
            query: (reference) => `patrons/funding-status/${reference}`,
        }),
        sendPatronWithdrawalOtp: builder.mutation<AppResponse<void>, void>({
            query: () => ({
                url: 'patrons/withdrawal/otp',
                method: 'POST',
            }),
        }),
        getPatronTransactions: builder.query<AppResponse<PatronTransactionsResponse>, { page?: number; limit?: number } | void>({
            query: (params) => ({
                url: 'patrons/transactions',
                params: params || {},
            }),
            providesTags: ['Wallet'],
        }),
        getPatronEarnings: builder.query<AppResponse<{ 
            assetBalance: number; 
            gkwthBalance: number; 
            conversionRate: number; 
            maxConvertibleAmount: number;
            nextAllowedConversionDate: string | null;
            transactions: any[]; 
            meta: any 
        }>, { page?: number } | void>({
            query: (params) => ({
                url: 'patrons/earnings',
                params: params || {},
            }),
            providesTags: ['Wallet'],
        }),
        getPatronAdminMember: builder.query<AppResponse<PatronAdminMemberInfo>, void>({
            query: () => 'patrons/admin-member',
            providesTags: ['Wallet'],
        }),
        getPatronAdminLinks: builder.query<AppResponse<PatronAdminLinksResponse>, void>({
            query: () => 'patrons/admin-links',
            providesTags: ['Wallet'],
        }),
        convertPatronEarnings: builder.mutation<AppResponse<{ convertedAmount: number; conversionRate: number }>, { amount: number }>({
            query: (body) => ({
                url: 'earnings/convert',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet'],
        }),
    }),
});

export const {
    useGetPatronPlansQuery,
    useGetPatronDashboardQuery,
    useGetPatronMembersQuery,
    useGetPatronGroupMembersQuery,
    useGetPatronBeneficiariesQuery,
    useAddPatronMemberMutation,
    useCreatePatronGroupMutation,
    useCreditPatronMemberMutation,
    useFundPatronGroupMutation,
    useCheckPatronFundingStatusQuery,
    useLazyCheckPatronFundingStatusQuery,
    useSendPatronWithdrawalOtpMutation,
    useGetPatronTransactionsQuery,
    useGetPatronEarningsQuery,
    useConvertPatronEarningsMutation,
    useGetPatronAdminMemberQuery,
    useGetPatronAdminLinksQuery,
} = patronApi;
