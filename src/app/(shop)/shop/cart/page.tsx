'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CartLineItem } from '@/components/shop/CartLineItem';
import { OrderSummary } from '@/components/shop/OrderSummary';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem, updateQuantity } from '@/store/features/shopCartSlice';
import { useMounted } from '@/hooks/useMounted';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
    const items = useAppSelector((state) => state.shopCart.items);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const dispatch = useAppDispatch();
    const router = useRouter();
    // The cart is hydrated from localStorage after mount, so the server always
    // renders an empty cart. Wait for mount before branching on `items` to avoid
    // a hydration mismatch for a returning visitor with items already saved.
    const mounted = useMounted();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const hasNonReturnableItems = items.some((item) => !item.isReturnable);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.push('/login?next=/shop/checkout');
            return;
        }
        router.push('/shop/checkout');
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

            {!mounted ? (
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-16 text-center">
                    <p className="mb-4 text-muted-foreground">Your cart is empty.</p>
                    <Button render={<Link href="/shop" />}>Continue Shopping</Button>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {items.map((item) => (
                            <CartLineItem
                                key={item.productId}
                                item={item}
                                onQuantityChange={(quantity) => dispatch(updateQuantity({ productId: item.productId, quantity }))}
                                onRemove={() => dispatch(removeItem(item.productId))}
                            />
                        ))}
                        <Link href="/shop#products" className="text-sm font-medium text-primary hover:underline">
                            &larr; Continue shopping
                        </Link>
                    </div>

                    <div>
                        <OrderSummary subtotal={subtotal} hasNonReturnableItems={hasNonReturnableItems}>
                            <Button size="lg" className="mt-4 w-full" onClick={handleCheckout}>
                                Proceed to Checkout
                            </Button>
                        </OrderSummary>
                    </div>
                </div>
            )}
        </div>
    );
}
