'use client';

import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { queryClient } from '@/lib/queryClient';
import { initAuth } from '@/store/features/authSlice';
import { ReactNode } from 'react';

// Inner component so we can use dispatch (must be inside <Provider>)
function AuthInitializer({ children }: { children: ReactNode }) {
    const dispatch = useDispatch();

    useEffect(() => {
        // Runs only on the client, after hydration — safe to read localStorage
        dispatch(initAuth());
    }, [dispatch]);

    return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <AuthInitializer>
                    {children}
                </AuthInitializer>
            </QueryClientProvider>
        </Provider>
    );
}
