import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// NOTE: Do NOT read from localStorage here — this runs on the server during SSR
// and causes a hydration mismatch (server: null, client: stored token → crash).
// Instead, call `initAuth` in a client-side useEffect after the app mounts.
const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload.accessToken);
                localStorage.setItem('refreshToken', action.payload.refreshToken);
            }
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        refreshTokenSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
            state.token = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload.accessToken);
                localStorage.setItem('refreshToken', action.payload.refreshToken);
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            }
        },
        setAuthStatus: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        // Called once on the client after mount to safely hydrate from localStorage
        initAuth: (state) => {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            if (token) {
                state.token = token;
                state.isAuthenticated = true;
            }
            if (refreshToken) {
                state.refreshToken = refreshToken;
            }
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, refreshTokenSuccess, logout, setAuthStatus, setUser, initAuth } = authSlice.actions;

export default authSlice.reducer;
