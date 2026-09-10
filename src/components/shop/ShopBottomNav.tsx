'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Package, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { useMounted } from '@/hooks/useMounted';
import { ROLES } from '@/types';

const CUSTOMER_TABS = [
    { href: '/shop', label: 'Home', icon: Home },
    { href: '/shop#products', label: 'Categories', icon: LayoutGrid },
    { href: '/shop/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/shop/orders', label: 'Orders', icon: Package },
    { href: '/dashboard', label: 'Account', icon: User },
] as const;

// Store guests have no /dashboard - the last tab points at their own
// account/upgrade page instead.
const STORE_GUEST_TABS = [
    { href: '/shop', label: 'Home', icon: Home },
    { href: '/shop#products', label: 'Categories', icon: LayoutGrid },
    { href: '/shop/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/shop/orders', label: 'Orders', icon: Package },
    { href: '/shop/account', label: 'Account', icon: User },
] as const;

export function ShopBottomNav() {
    const pathname = usePathname();
    const cartCount = useAppSelector((state) =>
        state.shopCart.items.reduce((sum, item) => sum + item.quantity, 0)
    );
    const isStoreGuest = useAppSelector((state) => state.auth.user?.role === ROLES.STORE_GUEST);
    const mounted = useMounted();
    const TABS = isStoreGuest ? STORE_GUEST_TABS : CUSTOMER_TABS;

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
            <div className="grid grid-cols-5">
                {TABS.map((tab) => {
                    const path = tab.href.split('#')[0] as string;
                    const isActive = tab.label !== 'Categories' && pathname === path;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.label}
                            href={tab.href}
                            className={cn(
                                'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <span className="relative inline-flex">
                                <Icon className="size-5" />
                                {tab.label === 'Cart' && mounted && cartCount > 0 && (
                                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
