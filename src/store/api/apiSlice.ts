import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { refreshTokenSuccess, logout } from '../features/authSlice';
import axios from 'axios';

export type AppResponse<T = unknown> = {
    status: "success" | "error" | "fail";
    message: string;
    data?: T;
    errors?: Record<string, string[] | undefined>;
};

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const authState = (api.getState() as RootState).auth;
        const refreshToken = authState.refreshToken;

        if (refreshToken) {
            try {
                const refreshResult = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`, {
                    refreshToken,
                });

                if (refreshResult.data) {
                    const { accessToken, refreshToken: newRefreshToken } = refreshResult.data.data;
                    api.dispatch(refreshTokenSuccess({ accessToken, refreshToken: newRefreshToken }));
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    api.dispatch(logout());
                }
            } catch {
                api.dispatch(logout());
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        } else {
            api.dispatch(logout());
        }
    }
    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: 'api',
    tagTypes: ['User', 'Withdrawal', 'Wallet', 'Loan'],
    endpoints: () => ({}),
});

