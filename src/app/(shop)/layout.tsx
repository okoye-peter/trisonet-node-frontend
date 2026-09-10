'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { ShopBottomNav } from '@/components/shop/ShopBottomNav';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/features/authSlice';
import { useGetUserQuery } from '@/store/api/userApi';
import LoadingScreen from '@/components/LoadingScreen';
import { ROLES } from '@/types';

// The shop is still being built out — restrict it to this one dev account until
// it's ready for everyone. Remove this guard (and the layout goes back to just
// rendering children) once the shop is ready for general release.
// Store-guest accounts (invited via another user's store-invite link) are always
// allowed in, regardless of this dev gate — the shop is their entire experience.
const SHOP_ALLOWED_USERNAME = 'dev_user';

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { token, isAuthenticated, user } = useAppSelector((state) => state.auth);

    // (shop) isn't wrapped in the main AuthGuard, so `user` may not be populated
    // yet even for a logged-in visitor who lands here directly — fetch it ourselves.
    const { data: userData, isLoading, isFetching } = useGetUserQuery(undefined, {
        skip: !token || !isAuthenticated,
    });

    useEffect(() => {
        if (userData?.data?.user) {
            dispatch(setUser(userData.data.user));
        }
    }, [userData, dispatch]);

    const resolvedUser = userData?.data?.user ?? user;
    const isStoreGuest = resolvedUser?.role === ROLES.STORE_GUEST;
    const isAllowed = resolvedUser?.username === SHOP_ALLOWED_USERNAME || isStoreGuest;
    const checking = isLoading || isFetching;

    useEffect(() => {
        if (!checking && !isAllowed) {
            // A store guest has no /dashboard to fall back to, so treat any failed
            // check the same as being unauthenticated.
            router.replace(isAuthenticated && !isStoreGuest ? '/dashboard' : '/login');
        }
    }, [checking, isAllowed, isAuthenticated, isStoreGuest, router]);

    if (checking || !isAllowed) {
        return <LoadingScreen message="Loading..." />;
    }

    return (
        <div className="shop-theme flex min-h-screen flex-col bg-background text-foreground">
            <ShopHeader />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <ShopFooter />
            <ShopBottomNav />
        </div>
    );
}
