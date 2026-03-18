import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import userReducer from './features/userSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
