import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    preferences: {
        theme: 'light' | 'dark' | 'system';
        notifications: boolean;
    };
}

interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    profile: null,
    isLoading: false,
    error: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<UserProfile>) => {
            state.profile = action.payload;
        },
        updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
            }
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
            if (state.profile) {
                state.profile.preferences.theme = action.payload;
            }
        },
        clearUser: (state) => {
            state.profile = null;
        },
    },
});

export const { setProfile, updateProfile, setTheme, clearUser } = userSlice.actions;

export default userSlice.reducer;
