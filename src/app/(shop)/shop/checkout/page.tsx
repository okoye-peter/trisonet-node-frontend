'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { OrderSummary } from '@/components/shop/OrderSummary';
import { useAppSelector } from '@/store/hooks';
import { useCreateShopOrderMutation } from '@/store/api/shopApi';
import { useMounted } from '@/hooks/useMounted';

const checkoutSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(7, 'A valid phone number is required'),
    address: z.string().min(5, 'Delivery address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const router = useRouter();
    const items = useAppSelector((state) => state.shopCart.items);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const [createOrder, { isLoading }] = useCreateShopOrderMutation();
    // Both auth and cart are hydrated client-side after mount, so branching on them
    // before mount would render differently than the server did. Treat "not yet
    // mounted" as its own loading state to avoid a hydration mismatch.
    const mounted = useMounted();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const hasNonReturnableItems = items.some((item) => !item.isReturnable);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { fullName: '', phone: '', address: '', city: '', state: '' },
    });

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login?next=/shop/checkout');
        }
    }, [mounted, isAuthenticated, router]);

    if (!mounted || !isAuthenticated) {
        return null;
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
                Your cart is empty.
            </div>
        );
    }

    async function onSubmit(values: CheckoutFormValues) {
        try {
            const res = await createOrder({
                items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                shipping: values,
            }).unwrap();

            router.push(`/shop/order-success?ref=${res.data?.refNo}`);
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: { message?: string } };
            if (apiErr.status === 401) {
                router.push('/login?next=/shop/checkout');
                return;
            }
            toast.error(apiErr.data?.message || 'Failed to place order. Please try again.');
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="rounded-xl border border-border p-4">
                                <h2 className="mb-4 font-semibold">Shipping Details</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Full name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Full name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Phone number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Delivery address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Delivery address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="City" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="State" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full lg:hidden" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Place Order
                            </Button>
                        </form>
                    </Form>
                </div>

                <div>
                    <OrderSummary subtotal={subtotal} hasNonReturnableItems={hasNonReturnableItems}>
                        <Button
                            size="lg"
                            className="mt-4 hidden w-full lg:flex"
                            disabled={isLoading}
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Place Order
                        </Button>
                    </OrderSummary>
                </div>
            </div>
        </div>
    );
}
