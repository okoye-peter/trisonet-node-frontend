'use client';

import { useEffect } from 'react';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { ShopFooter } from '@/components/shop/ShopFooter';
import { ShopBottomNav } from '@/components/shop/ShopBottomNav';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/features/authSlice';
import { useGetUserQuery } from '@/store/api/userApi';

// The shop is public: anyone can browse and check out as a guest without an
// account. Logged-in users (including store-guest accounts) still get their
// profile fetched here so the header/checkout can personalize for them, since
// (shop) isn't wrapped in the main AuthGuard.
export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const dispatch = useAppDispatch();
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

    const { data: userData } = useGetUserQuery(undefined, {
        skip: !token || !isAuthenticated,
    });

    useEffect(() => {
        if (userData?.data?.user) {
            dispatch(setUser(userData.data.user));
        }
    }, [userData, dispatch]);

    return (
        <div className="shop-theme flex min-h-screen flex-col bg-background text-foreground">
            <ShopHeader />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <ShopFooter />
            <ShopBottomNav />
        </div>
    );
}
