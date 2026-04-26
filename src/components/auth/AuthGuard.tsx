'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import LoadingScreen from '@/components/LoadingScreen';
import { setUser } from '@/store/features/authSlice';
import { useGetUserQuery } from '@/store/api/userApi';
import { store } from '@/store';
import { ROLES } from '@/types';

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

            // Mandatory KYC Verification Check (Only for Customers)
            const hasVerifiedLevel2 = userData.data.hasVerifiedLevel2;
            const isCustomer = userData.data.role === ROLES.CUSTOMER;
            const isDashboard = pathname === '/dashboard';
            const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);

            if (isAuthenticated && isCustomer && !hasVerifiedLevel2 && !isDashboard && !isAuthPage) {
                router.push('/dashboard');
            }
        }

        if (userError) {
            router.push('/login');
        }

        const checkAuth = () => {
            // Read CURRENT state from store directly to avoid stale closure values.
            // This is critical because initAuth() is dispatched in the parent (Providers)
            // useEffect which runs synchronously BEFORE this child effect — so the Redux
            // store already has the correct token by this point, but the component closure
            // still reflects the pre-dispatch render snapshot.
            const { isAuthenticated: currentAuth, token: currentToken } = store.getState().auth;

            if (!currentAuth && !currentToken) {
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
