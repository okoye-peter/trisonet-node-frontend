import { apiSlice, type AppResponse } from './apiSlice';
import type { User, UpdatePasswordRequest } from '@/types';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUser: builder.query<AppResponse<User>, void>({
            query: () => 'users/me',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<AppResponse<User>, Partial<User>>({
            query: (body) => ({
                url: 'users/update',
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
        getUserByTransferId: builder.query<AppResponse<User>, string>({
            query: (transferId) => `users/lookup/${transferId}`,
        }),
    }),
});

export const { useGetUserQuery, useUpdateProfileMutation, useUpdatePasswordMutation, useSendOtpMutation, useGetUserByTransferIdQuery } = userApi;

