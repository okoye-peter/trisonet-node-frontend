import { apiSlice, type AppResponse } from './apiSlice';
import type { 
    User, 
    PatronDashboardResponse, 
    PatronBeneficiariesResponse,
    PatronMembersResponse,
    PatronGroupTransaction,
    PagaVirtualAccountDetails,
    PatronPlanDetail
} from '@/types';

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
        getPatronBeneficiaries: builder.query<AppResponse<PatronBeneficiariesResponse>, { page?: number } | void>({
            query: (params) => ({
                url: 'patrons/beneficiaries',
                params: params || {},
            }),
            providesTags: ['User'],
        }),
        addPatronMember: builder.mutation<AppResponse<User>, { name: string; email: string; phone: string; password?: string }>({
            query: (body) => ({
                url: 'patrons/members',
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
    }),
});

export const {
    useGetPatronPlansQuery,
    useGetPatronDashboardQuery,
    useGetPatronMembersQuery,
    useGetPatronBeneficiariesQuery,
    useAddPatronMemberMutation,
    useCreatePatronGroupMutation,
    useCreditPatronMemberMutation,
    useFundPatronGroupMutation,
    useCheckPatronFundingStatusQuery,
    useLazyCheckPatronFundingStatusQuery,
    useSendPatronWithdrawalOtpMutation,
} = patronApi;
