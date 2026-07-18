'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Copy, CreditCard, Landmark, Gavel } from 'lucide-react';
import { useGetAuctionQuery, useClaimAuctionMutation } from '@/store/api/auctionApi';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import LoadingScreen from '@/components/LoadingScreen';
import type { AuctionClaimResponse } from '@/types';

const PAGA_SCRIPT_URL = 'https://checkout.paga.com/checkout/inline-js';

function loadScript(src: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (id && document.getElementById(id)) { resolve(); return; }
        const s = document.createElement('script');
        if (id) s.id = id;
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(s);
    });
}

async function loadPagaScript(): Promise<void> {
    if (window.PagaCheckout) return;
    document.getElementById('paga-script')?.remove();
    await loadScript(PAGA_SCRIPT_URL, 'paga-script');
    await loadScript('/paga-bridge.js');
    if (!window.PagaCheckout) throw new Error('PagaCheckout not defined after load');
}

export default function ClaimAuctionPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency

    const [claimAuction, { isLoading: isClaiming }] = useClaimAuctionMutation();
    const [claim, setClaim] = useState<AuctionClaimResponse | null>(null);
    const [isPayingWithCard, setIsPayingWithCard] = useState(false);

    const { data, isLoading } = useGetAuctionQuery(id, {
        pollingInterval: claim ? 5000 : undefined,
    });
    const auction = data?.data;

    useEffect(() => {
        if (auction?.status === 'completed') {
            toast.success('Payment confirmed! Your GKWTH has been credited.');
            router.push(`/wallets/gkwth/auction/${id}/won`);
        } else if (auction?.status === 'cancelled') {
            toast.error('This claim window has expired and the auction was cancelled.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auction?.status]);

    const handleClaim = async () => {
        try {
            const res = await claimAuction(id).unwrap();
            if (res.data) setClaim(res.data);
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to claim auction');
        }
    };

    const handlePayWithCard = async () => {
        if (!claim) return;
        setIsPayingWithCard(true);
        try {
            await loadPagaScript();

            window.PagaCheckout.setOptions({
                publicKey: claim.cardPayment.publicKey || '',
                amount: Number(claim.amount.toFixed(2)),
                currency: 'NGN',
                email: claim.cardPayment.email,
                phoneNumber: claim.cardPayment.phoneNumber,
                payment_reference: claim.reference,
                funding_sources: 'CARD',
                callback_url: process.env.NEXT_PUBLIC_PAGA_CALLBACK_URL,
                charge_url: `${window.location.origin}${window.location.pathname}`,
            });

            window.PagaCheckout.openCheckout();

            const boostZ = (node: Element) => {
                (node as HTMLElement).style.setProperty('z-index', '2147483647', 'important');
            };
            const observer = new MutationObserver(() => {
                document.querySelectorAll('iframe').forEach((iframe) => {
                    if (iframe.src.includes('paga.com')) {
                        boostZ(iframe);
                        if (iframe.parentElement) boostZ(iframe.parentElement);
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => observer.disconnect(), 10000);
        } catch (err) {
            console.error('Card payment error:', err);
            toast.error('Failed to launch card payment. Please try bank transfer instead.');
        } finally {
            setIsPayingWithCard(false);
        }
    };

    const copyAccountNumber = () => {
        if (!claim?.bankTransfer.accountNumber) return;
        navigator.clipboard.writeText(claim.bankTransfer.accountNumber);
        toast.success('Account number copied!');
    };

    if (isLoading) return <LoadingScreen />;
    if (!auction) return <div className="py-16 text-center text-zinc-400">Auction not found.</div>;

    if (auction.status === 'cancelled') {
        return (
            <div className="mx-auto max-w-lg py-16 text-center">
                <Gavel size={40} className="mx-auto mb-4 text-zinc-300" />
                <h1 className="text-xl font-black text-zinc-900">This claim has expired</h1>
                <p className="mt-2 text-sm text-zinc-500">
                    The 48-hour claim window lapsed before payment was completed, so this auction was cancelled.
                </p>
            </div>
        );
    }

    if (auction.status !== 'awaiting_payment') {
        return (
            <div className="mx-auto max-w-lg py-16 text-center">
                <Gavel size={40} className="mx-auto mb-4 text-zinc-300" />
                <h1 className="text-xl font-black text-zinc-900">Nothing to claim here</h1>
                <p className="mt-2 text-sm text-zinc-500">This auction isn&apos;t currently awaiting payment.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-[#1a1060] p-8">
                <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="relative z-10">
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-amber-300 backdrop-blur">
                        🎉 You Won This Auction
                    </div>
                    <h1 className="mb-2 text-2xl font-black text-white md:text-3xl">
                        {auction.gkwthAmount} <span className="text-indigo-300">GKWTH</span>
                    </h1>
                    <p className="text-sm text-white/60">
                        Complete payment of {currency}{(claim?.amount ?? auction.currentTopBid).toLocaleString()} to receive your GKWTH.
                    </p>
                    {auction.claimDeadlineAt && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs text-white/40">Time left to claim:</span>
                            <CountdownTimer endsAt={auction.claimDeadlineAt} />
                        </div>
                    )}
                </div>
            </div>

            {!claim ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
                    <p className="mb-4 text-sm text-zinc-500">
                        Get your payment details to complete this purchase. If you don&apos;t pay before the deadline, the auction goes back to the seller.
                    </p>
                    <button
                        type="button"
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isClaiming ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} />}
                        Claim & Get Payment Details
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-zinc-200 bg-white">
                        <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4">
                            <Landmark size={16} className="text-indigo-600" />
                            <div className="text-sm font-bold text-zinc-900">Pay by Bank Transfer</div>
                        </div>
                        <div className="space-y-3 p-5">
                            {[
                                ['Bank Name', claim.bankTransfer.bankName || '—'],
                                ['Account Name', claim.bankTransfer.accountName || '—'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">{label}</span>
                                    <span className="text-sm font-bold text-zinc-900">{value}</span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Account Number</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-black tracking-wider text-zinc-900">{claim.bankTransfer.accountNumber}</span>
                                    <button onClick={copyAccountNumber} className="rounded p-1 text-indigo-600 hover:bg-indigo-50">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-px bg-zinc-100" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-900">Amount to Pay</span>
                                <span className="text-lg font-black text-indigo-700">{currency}{claim.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-200" />
                        <span className="text-xs font-bold text-zinc-400">OR</span>
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>

                    <button
                        type="button"
                        onClick={handlePayWithCard}
                        disabled={isPayingWithCard}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-600 py-3 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 disabled:opacity-50"
                    >
                        {isPayingWithCard ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                        Pay With Card Instead
                    </button>

                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                        <Loader2 size={14} className="shrink-0 animate-spin" />
                        Waiting for payment confirmation — this page updates automatically once we receive it.
                    </div>
                </div>
            )}
        </div>
    );
}
