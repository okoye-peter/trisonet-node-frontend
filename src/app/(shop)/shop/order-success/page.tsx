'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/features/shopCartSlice';
import { shopApi, useGetShopOrderQuery, useLazyCheckShopOrderStatusQuery } from '@/store/api/shopApi';
import { formatNaira } from '@/lib/shopUtils';

type View = 'awaiting_transfer' | 'verifying' | 'confirmed' | 'timeout';

const POLL_MAX_TIME_MS = 120000;
const POLL_INITIAL_DELAY_MS = 2000;
const POLL_MAX_DELAY_MS = 30000;

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const ref = searchParams.get('ref');
    // Present only for a guest checkout (no account) — see checkout/page.tsx — and
    // doubles as the credential for looking up this order without being logged in.
    const guestEmail = searchParams.get('email') || undefined;

    const { data: orderResponse, isLoading } = useGetShopOrderQuery({ refNo: ref as string, email: guestEmail }, { skip: !ref });
    const [checkStatus] = useLazyCheckShopOrderStatusQuery();
    const order = orderResponse?.data;

    const [view, setView] = useState<View>('awaiting_transfer');
    const pollCancelled = useRef(false);

    useEffect(() => {
        if (!order) return;
        if (order.paymentStatus === 'paid') {
            dispatch(clearCart());
            // This page's own getShopOrder cache entry (keyed by refNo, since
            // email: undefined serializes the same as omitting it) still holds the
            // pre-payment "pending" snapshot — bust it so /shop/orders/[refNo]
            // doesn't render that stale data after we navigate there below.
            dispatch(shopApi.util.invalidateTags([{ type: 'ShopOrder', id: order.refNo }]));
            setView('confirmed');
            // A guest has no /shop/orders/[refNo] (that page requires an account) —
            // they just see the confirmed state and stay here.
            if (guestEmail) return;
            const t = setTimeout(() => router.push(`/shop/orders/${order.refNo}`), 1200);
            return () => clearTimeout(t);
        }
        if (order.paymentStatus === 'failed') {
            setView('timeout');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order?.paymentStatus]);

    useEffect(() => {
        return () => { pollCancelled.current = true; };
    }, []);

    if (!ref) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
                No order reference provided.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center py-24">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const startPolling = () => {
        pollCancelled.current = false;
        setView('verifying');

        let totalTime = 0;
        let delay = POLL_INITIAL_DELAY_MS;

        const poll = async () => {
            if (pollCancelled.current) return;

            if (totalTime >= POLL_MAX_TIME_MS) {
                setView('timeout');
                return;
            }

            try {
                const res = await checkStatus({ refNo: ref, email: guestEmail }).unwrap();
                if (res.data?.status === 'paid') {
                    dispatch(clearCart());
                    dispatch(shopApi.util.invalidateTags([{ type: 'ShopOrder', id: ref }]));
                    setView('confirmed');
                    toast.success('Payment confirmed!');
                    if (!guestEmail) {
                        setTimeout(() => router.push(`/shop/orders/${ref}`), 1200);
                    }
                    return;
                }
                if (res.data?.status === 'failed') {
                    setView('timeout');
                    return;
                }
            } catch {
                // keep polling — a transient failure here shouldn't stop the countdown
            }

            setTimeout(() => {
                totalTime += delay;
                delay = Math.min(delay * 1.5, POLL_MAX_DELAY_MS);
                poll();
            }, delay);
        };

        poll();
    };

    const copyAccountNumber = () => {
        if (!order?.virtualAccount) return;
        navigator.clipboard.writeText(order.virtualAccount.account_number);
        toast.success('Account number copied');
    };

    return (
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            {view === 'confirmed' && (
                <>
                    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="size-8 text-primary" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">Payment confirmed!</h1>
                    <p className="mb-6 text-muted-foreground">
                        Your order <span className="font-semibold text-foreground">#{order?.refNo ?? ref}</span> is being processed.
                        {guestEmail
                            ? ' Save this reference number to track your order.'
                            : ' Taking you to your order…'}
                    </p>
                </>
            )}

            {view === 'verifying' && (
                <>
                    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">Confirming your payment</h1>
                    <p className="mb-6 text-muted-foreground">
                        This can take up to 2 minutes. Please don&apos;t close this page.
                    </p>
                </>
            )}

            {view === 'awaiting_transfer' && order?.virtualAccount && (
                <>
                    <h1 className="mb-2 text-2xl font-bold">Complete your payment</h1>
                    <p className="mb-6 text-muted-foreground">
                        Order <span className="font-semibold text-foreground">#{order.refNo}</span> — transfer the exact amount below to complete your purchase.
                    </p>

                    <div className="mb-6 w-full space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-left text-sm">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">Bank Name</span>
                            <span className="font-semibold">{order.virtualAccount.bank_name}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">Account Name</span>
                            <span className="font-semibold">{order.virtualAccount.account_name}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">Account Number</span>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold tracking-wider">{order.virtualAccount.account_number}</span>
                                <button onClick={copyAccountNumber} aria-label="Copy account number" className="rounded p-1 text-primary hover:bg-primary/10">
                                    <Copy className="size-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Amount to Pay</span>
                            <span className="text-lg font-black">{formatNaira(Number(order.virtualAccount.amount))}</span>
                        </div>
                    </div>

                    <div className="mb-6 w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-700">
                        <span className="font-bold">Important:</span> This account is valid for 30 minutes only. Please transfer the exact amount within this period.
                    </div>

                    <Button size="lg" className="w-full" onClick={startPolling}>
                        I have sent the money
                    </Button>
                </>
            )}

            {view === 'timeout' && (
                <>
                    <h1 className="mb-2 text-2xl font-bold">We couldn&apos;t confirm your payment</h1>
                    <p className="mb-2 text-muted-foreground">
                        Order <span className="font-semibold text-foreground">#{order?.refNo ?? ref}</span>
                    </p>
                    <p className="mb-6 text-muted-foreground">
                        If you&apos;ve already sent the money, please hold on for up to 30 minutes and check back — it may still be processing.
                        If it&apos;s still not confirmed after that, reach out to customer care (info@trisonet.com or trisonetasset@gmail.com, or our complaints WhatsApp group) with proof of payment for help.
                    </p>
                    <div className="flex w-full gap-3">
                        <Button variant="outline" size="lg" className="flex-1" onClick={startPolling}>
                            Check again
                        </Button>
                        {!guestEmail && (
                            <Button size="lg" className="flex-1" render={<Link href="/shop/orders" />}>
                                View my orders
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={null}>
            <OrderSuccessContent />
        </Suspense>
    );
}
