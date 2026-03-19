import { apiSlice, type AppResponse } from './apiSlice';
import { WithdrawalRequest } from '@/types';

export const withdrawalApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        initiateWithdrawal: builder.mutation<AppResponse<WithdrawalRequest>, {
            amount: number;
            bank_code: string;
            bank_name: string;
            account_name: string;
            account_number: string;
            wallet: string;
            withdrawal_pin?: string;
            withdrawal_otp?: string;
        }>({
            query: (body) => ({
                url: 'withdrawal',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User', 'Withdrawal'],
        }),
    }),
});

export const { useInitiateWithdrawalMutation } = withdrawalApi;
