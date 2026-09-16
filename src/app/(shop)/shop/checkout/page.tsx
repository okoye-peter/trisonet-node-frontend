'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
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
    // Only collected (and required) for guest checkout — a logged-in buyer's
    // account email is used instead. See onSubmit / the isAuthenticated branch below.
    email: z.string().email('A valid email is required').optional().or(z.literal('')),
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
    const user = useAppSelector((state) => state.auth.user);
    const [createOrder, { isLoading }] = useCreateShopOrderMutation();
    // Both auth and cart are hydrated client-side after mount, so branching on them
    // before mount would render differently than the server did. Treat "not yet
    // mounted" as its own loading state to avoid a hydration mismatch.
    const mounted = useMounted();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const hasNonReturnableItems = items.some((item) => !item.isReturnable);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { fullName: '', email: '', phone: '', address: '', city: '', state: '' },
    });

    // A logged-in buyer's name/phone/email are already on file — the backend still
    // requires them in the shipping payload, so submit the account's values instead
    // of asking the user to retype them. Only guests fill these in themselves.
    useEffect(() => {
        if (isAuthenticated && user) {
            form.setValue('fullName', user.name);
            form.setValue('phone', user.phone);
            form.setValue('email', user.email);
        }
    }, [isAuthenticated, user, form]);

    if (!mounted) {
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
        if (!isAuthenticated && !values.email) {
            form.setError('email', { message: 'An email address is required to check out as a guest' });
            return;
        }

        try {
            const res = await createOrder({
                items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                shipping: values,
            }).unwrap();

            const params = new URLSearchParams({ ref: res.data?.refNo ?? '' });
            if (!isAuthenticated && values.email) {
                params.set('email', values.email);
            }
            router.push(`/shop/order-success?${params.toString()}`);
        } catch (err: unknown) {
            const apiErr = err as { status?: number; data?: { message?: string } };
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
                            {!isAuthenticated && (
                                <p className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                                    Checking out as a guest.{' '}
                                    <Link href="/login?next=/shop/checkout" className="font-medium text-primary hover:underline">
                                        Log in
                                    </Link>{' '}
                                    to track this order under your account instead.
                                </p>
                            )}
                            <div className="rounded-xl border border-border p-4">
                                <h2 className="mb-4 font-semibold">
                                    {isAuthenticated ? 'Delivery Details' : 'Shipping Details'}
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {!isAuthenticated && (
                                        <>
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
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="sm:col-span-2">
                                                        <FormLabel>Email address</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="Email address" {...field} />
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
                                        </>
                                    )}
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
