import { apiSlice, type AppResponse } from './apiSlice';
import type { User, UpdatePasswordRequest, UpdateProfileRequest, UpdateBankRequest, DashboardStats, ActivationCandidate } from '@/types';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUser: builder.query<AppResponse<{ user: User }>, void>({
            query: () => 'users/me',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<AppResponse<User>, UpdateProfileRequest>({
            query: (body) => ({
                url: 'users/update',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        updateBankDetails: builder.mutation<AppResponse<User>, UpdateBankRequest>({
            query: (body) => ({
                url: 'users/update-bank',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        updatePassword: builder.mutation<AppResponse<void>, UpdatePasswordRequest>({
            query: (body) => ({
                url: 'users/update-password',
                method: 'PATCH',
                body,
            }),
        }),
        sendOtp: builder.mutation<AppResponse<void>, void>({
            query: () => ({
                url: 'users/send-otp',
                method: 'POST',
            }),
        }),
        sendWithdrawalPinOtp: builder.mutation<AppResponse<void>, void>({
            query: () => ({
                url: 'users/send-withdrawal-pin-otp',
                method: 'POST',
            }),
        }),
        resetWithdrawalPin: builder.mutation<AppResponse<void>, { otp: string; newPin: string }>({
            query: (body) => ({
                url: 'users/reset-withdrawal-pin',
                method: 'POST',
                body,
            }),
        }),
        verifyWithdrawalPinOtp: builder.mutation<AppResponse<void>, { otp: string }>({
            query: (body) => ({
                url: 'users/verify-withdrawal-pin-otp',
                method: 'POST',
                body,
            }),
        }),
        getUserByTransferId: builder.query<AppResponse<User>, string>({
            query: (transferId) => `users/lookup/${transferId}`,
        }),
        getUserDashboardStats: builder.query<AppResponse<DashboardStats>, void>({
            query: () => 'users/dashboard-stats',
            providesTags: ['User', 'Wallet'],
        }),
        getActivationCandidates: builder.query<AppResponse<ActivationCandidate[]>, void>({
            query: () => 'users/activation-candidates',
            providesTags: ['User'],
        }),
        initiateActivationPayment: builder.mutation<AppResponse<{ reference: string; amount: number; publicKey: string; email: string; phoneNumber: string }>, { teamMateIds: string[] }>({
            query: (body) => ({
                url: 'payment/activation/initiate',
                method: 'POST',
                body
            }),
        }),
        generateActivationVirtualAccount: builder.mutation<AppResponse<{ 
            account_detail: { 
                account_name: string; 
                bank_name: string; 
                account_number: string; 
                expires_at: string; 
                reference: string;
            } 
        }>, { amount: string; teamMateIds: string[] }>({
            query: (body) => ({
                url: 'payment/activation/virtual-account',
                method: 'POST',
                body
            }),
        }),
        checkActivationStatus: builder.query<AppResponse<{ status: string }>, string>({
            query: (reference) => `payment/activation/status/${reference}`,
        }),
        submitActivationProof: builder.mutation<AppResponse<any>, FormData>({
            query: (formData) => ({
                url: 'payment/activation/proof',
                method: 'POST',
                body: formData
            }),
        }),
        activateByCode: builder.mutation<AppResponse<any>, { activation_code: string; teamMateIds: string[] }>({
            query: (body) => ({
                url: 'payment/activation/code',
                method: 'POST',
                body
            }),
        }),
        sendEmailVerificationOtp: builder.mutation<AppResponse<void>, { email: string }>({
            query: (body) => ({
                url: 'users/send-email-verification-otp',
                method: 'POST',
                body
            }),
        }),
        verifyEmailOtp: builder.mutation<AppResponse<void>, { otp: string }>({
            query: (body) => ({
                url: 'users/verify-email-otp',
                method: 'POST',
                body
            }),
            invalidatesTags: ['User'],
        }),
        generatePukVirtualAccount: builder.mutation<AppResponse<{
            status: boolean;
            account_detail: {
                account_name: string;
                bank_name: string;
                account_number: string;
                expires_at: string;
                amount: number;
                reference: string;
            };
        }>, void>({
            query: () => ({
                url: 'payment/puk/generate-virtual-account',
                method: 'POST',
            }),
        }),
        unblockWithPuk: builder.mutation<AppResponse<{ status: boolean; message: string }>, { puk: string }>({
            query: (body) => ({
                url: 'payment/puk/unblock-with-puk',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const {
    useGetUserQuery,
    useUpdateProfileMutation,
    useUpdateBankDetailsMutation,
    useUpdatePasswordMutation,
    useSendOtpMutation,
    useGetUserByTransferIdQuery,
    useSendWithdrawalPinOtpMutation,
    useVerifyWithdrawalPinOtpMutation,
    useResetWithdrawalPinMutation,
    useGetUserDashboardStatsQuery,
    useGetActivationCandidatesQuery,
    useInitiateActivationPaymentMutation,
    useGenerateActivationVirtualAccountMutation,
    useCheckActivationStatusQuery,
    useLazyCheckActivationStatusQuery,
    useSubmitActivationProofMutation,
    useActivateByCodeMutation,
    useSendEmailVerificationOtpMutation,
    useVerifyEmailOtpMutation,
    useGeneratePukVirtualAccountMutation,
    useUnblockWithPukMutation,
} = userApi;

