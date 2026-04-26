import { apiSlice, type AppResponse } from './apiSlice';
import type { 
    User, 
    PatronDashboardResponse, 
    PatronBeneficiariesResponse,
    PatronMembersResponse,
    PatronGroupTransaction 
} from '@/types';

export const patronApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
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
        creditPatronMember: builder.mutation<AppResponse<PatronGroupTransaction>, { amount: number; member_id: string }>({
            query: (body) => ({
                url: 'patrons/credit-member',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet'],
        }),
        fundPatronGroup: builder.mutation<AppResponse<PagaVirtualAccountDetails>, { amount: number }>({
            query: (body) => ({
                url: 'patrons/fund-group',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Wallet'],
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
    useGetPatronDashboardQuery,
    useGetPatronMembersQuery,
    useGetPatronBeneficiariesQuery,
    useAddPatronMemberMutation,
    useCreditPatronMemberMutation,
    useFundPatronGroupMutation,
    useSendPatronWithdrawalOtpMutation,
} = patronApi;
