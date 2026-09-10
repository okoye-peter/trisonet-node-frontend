'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronDown, ShoppingCart } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useMounted } from '@/hooks/useMounted';
import { useGetShopCategoriesQuery } from '@/store/api/shopApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROLES } from '@/types';

export function ShopHeader() {
    const cartCount = useAppSelector((state) =>
        state.shopCart.items.reduce((sum, item) => sum + item.quantity, 0)
    );
    const isStoreGuest = useAppSelector((state) => state.auth.user?.role === ROLES.STORE_GUEST);
    const { data: categoriesResponse } = useGetShopCategoriesQuery();
    const categories = categoriesResponse?.data ?? [];

    // The cart is hydrated from localStorage after mount (see initShopCart), so the
    // server always renders a count of 0. Gate the badge on `mounted` to guarantee
    // the first client render matches the server, avoiding a hydration mismatch for
    // returning visitors who already have items in their cart.
    const mounted = useMounted();

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                <div className="flex items-center gap-3">
                    {!isStoreGuest && (
                        <>
                            <Link
                                href="/dashboard"
                                aria-label="Back to Dashboard"
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="size-5" />
                                <span className="hidden text-sm font-medium sm:inline">Dashboard</span>
                            </Link>
                            <span className="h-6 w-px bg-border" />
                        </>
                    )}
                    <Link href="/shop" className="flex items-center gap-2 text-lg font-bold">
                        <Image src="/logo.png" alt="Trisonet" width={32} height={32} />
                        <span className="hidden sm:inline">Trisonet Shop</span>
                    </Link>
                </div>

                <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                    <Link href="/shop" className="text-muted-foreground hover:text-foreground">
                        Home
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground outline-none hover:text-foreground data-popup-open:text-foreground">
                            Categories
                            <ChevronDown className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-80 w-56">
                            <DropdownMenuItem render={<Link href="/shop#products" />}>
                                All Products
                            </DropdownMenuItem>
                            {categories.map((category) => (
                                <DropdownMenuItem
                                    key={category.id}
                                    render={<Link href={`/shop?category=${category.id}#products`} />}
                                >
                                    {category.displayName}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/shop/orders" className="text-muted-foreground hover:text-foreground">
                        Orders
                    </Link>

                    {isStoreGuest && (
                        <Link href="/shop/account" className="text-muted-foreground hover:text-foreground">
                            Account
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" render={<Link href="/shop/cart" aria-label="Cart" />}>
                        <span className="relative inline-flex">
                            <ShoppingCart className="size-5" />
                            {mounted && cartCount > 0 && (
                                <Badge className="absolute -right-2 -top-2 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]">
                                    {cartCount}
                                </Badge>
                            )}
                        </span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
