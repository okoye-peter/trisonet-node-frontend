'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import LoadingScreen from '@/components/LoadingScreen';
import { setAuthStatus, setUser } from '@/store/features/authSlice';
import { useGetUserQuery } from '@/store/api/userApi';


export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token, isLoading: authLoading } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const [isChecking, setIsChecking] = useState(true);

    const { data: userData, error: userError, isLoading: userQueryLoading } = useGetUserQuery(undefined, {
        skip: !token || !isAuthenticated,
    });


    useEffect(() => {
        if (userData?.data) {
            dispatch(setUser(userData.data));
        }

        if (userError) {
            router.push('/login');
        }

        // Hydrate authentication status from token if available
        if (token && !isAuthenticated) {
            dispatch(setAuthStatus(true));
        }

        const checkAuth = () => {
            const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (!storedToken && !isAuthenticated) {
                if (pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password') {
                    router.push('/login');
                }
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [isAuthenticated, token, router, pathname, dispatch, userData, userError]);


    // Show loading screen while checking auth or during auth transitions
    if (isChecking || authLoading || userQueryLoading) {

        return <LoadingScreen message="Verifying session..." />;
    }

    // If not authenticated and no token, don't render children (the useEffect will redirect)
    if (!isAuthenticated && !token) {
        return <LoadingScreen message="Redirecting to login..." />;
    }

    return <>{children}</>;
}
