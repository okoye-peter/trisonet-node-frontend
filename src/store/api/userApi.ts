import { apiSlice, type AppResponse } from './apiSlice';
import type { User, UpdatePasswordRequest, UpdateProfileRequest, UpdateBankRequest } from '@/types';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUser: builder.query<AppResponse<User>, void>({
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
        getUserByTransferId: builder.query<AppResponse<User>, string>({
            query: (transferId) => `users/lookup/${transferId}`,
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
    useResetWithdrawalPinMutation
} = userApi;

