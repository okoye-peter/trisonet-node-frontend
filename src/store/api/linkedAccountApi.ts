import { apiSlice, type AppResponse } from './apiSlice';

export interface LinkedAccount {
    id: string;
    name: string;
    username: string | null;
    email: string | null;
    role: number;
    roleLabel: string;
    pictureUrl: string | null;
    isCurrent: boolean;
}

export interface LinkRequestResult {
    destination: string;
    account: LinkedAccount;
}

/** Node-hosted accounts get tokens; PHP-hosted accounts (sponsors) get a one-time redirectUrl instead. */
export interface SwitchAccountResult {
    user: LinkedAccount;
    accessToken?: string;
    refreshToken?: string;
    redirectUrl?: string;
}

export const linkedAccountApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLinkedAccounts: builder.query<AppResponse<LinkedAccount[]>, void>({
            query: () => 'linked-accounts',
            providesTags: ['LinkedAccount'],
        }),
        requestAccountLink: builder.mutation<AppResponse<LinkRequestResult>, { identifier: string; password?: string }>({
            query: (body) => ({ url: 'linked-accounts/link/request', method: 'POST', body }),
        }),
        verifyAccountLink: builder.mutation<AppResponse<LinkedAccount[]>, { otp: string }>({
            query: (body) => ({ url: 'linked-accounts/link/verify', method: 'POST', body }),
            invalidatesTags: ['LinkedAccount'],
        }),
        unlinkAccount: builder.mutation<AppResponse<LinkedAccount[]>, string>({
            query: (userId) => ({ url: `linked-accounts/${userId}`, method: 'DELETE' }),
            invalidatesTags: ['LinkedAccount'],
        }),
        switchAccount: builder.mutation<AppResponse<SwitchAccountResult>, string>({
            query: (userId) => ({ url: `linked-accounts/${userId}/switch`, method: 'POST' }),
        }),
    }),
});

export const {
    useGetLinkedAccountsQuery,
    useRequestAccountLinkMutation,
    useVerifyAccountLinkMutation,
    useUnlinkAccountMutation,
    useSwitchAccountMutation,
} = linkedAccountApi;
