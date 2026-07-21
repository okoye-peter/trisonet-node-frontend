'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Copy, CreditCard, Landmark, Gavel } from 'lucide-react';
import { useGetAuctionQuery, useClaimAuctionMutation, useGetAuctionSettingsQuery } from '@/store/api/auctionApi';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';
import type { AuctionClaimResponse } from '@/types';
import { formatGkwth } from '@/lib/utils';

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

    const { data: settingsResponse } = useGetAuctionSettingsQuery();
    // Prefer the percent the claim was actually generated with; fall back to current settings
    // before the buyer has claimed yet, so the pre-claim notice can still show a real number.
    const cardChargePercent = claim?.cardPayment.chargePercent ?? settingsResponse?.data?.cardChargePercent ?? 0;

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
                amount: Number(claim.cardPayment.amount.toFixed(2)),
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
    if (!auction) return <div className="py-16 text-center text-muted-foreground">Auction not found.</div>;

    if (auction.status === 'cancelled') {
        return (
            <div className="mx-auto max-w-lg py-16 text-center">
                <Gavel size={40} className="mx-auto mb-4 text-muted-foreground/40" />
                <h1 className="text-xl font-bold text-foreground">This claim has expired</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    The 48-hour claim window lapsed before payment was completed, so this auction was cancelled.
                </p>
            </div>
        );
    }

    if (auction.status !== 'awaiting_payment') {
        return (
            <div className="mx-auto max-w-lg py-16 text-center">
                <Gavel size={40} className="mx-auto mb-4 text-muted-foreground/40" />
                <h1 className="text-xl font-bold text-foreground">Nothing to claim here</h1>
                <p className="mt-2 text-sm text-muted-foreground">This auction isn&apos;t currently awaiting payment.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div className="border-b border-border pb-6 text-center">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-600">🎉 You Won This Auction</div>
                <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                    {formatGkwth(auction.gkwthAmount)} <span className="text-indigo-600">GKWTH</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                    Complete payment of {currency}{(claim?.bankTransfer.amount ?? auction.currentTopBid).toLocaleString()} to receive your GKWTH.
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                    Bank transfer includes Paga&apos;s own transfer fee (already added to the amount shown); card payments include a {cardChargePercent}% processing fee instead.
                </p>
                {auction.claimDeadlineAt && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-xs text-muted-foreground">Time left to claim:</span>
                        <CountdownTimer endsAt={auction.claimDeadlineAt} />
                    </div>
                )}
            </div>

            {!claim ? (
                <Card className="p-6 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                        Get your payment details to complete this purchase. If you don&apos;t pay before the deadline, the auction goes back to the seller.
                    </p>
                    <Button type="button" onClick={handleClaim} disabled={isClaiming} className="w-full bg-indigo-600 py-3 text-white hover:bg-indigo-700">
                        {isClaiming ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} />}
                        Claim & Get Payment Details
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    <Card className="gap-0 py-0">
                        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                            <Landmark size={16} className="text-indigo-600" />
                            <div className="text-sm font-semibold text-foreground">Pay by Bank Transfer</div>
                        </div>
                        <div className="space-y-3 p-5">
                            {[
                                ['Bank Name', claim.bankTransfer.bankName || '—'],
                                ['Account Name', claim.bankTransfer.accountName || '—'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{label}</span>
                                    <span className="text-sm font-bold text-foreground">{value}</span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Account Number</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold tracking-wider text-foreground">{claim.bankTransfer.accountNumber}</span>
                                    <button onClick={copyAccountNumber} className="rounded p-1 text-indigo-600 hover:bg-indigo-50">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-px bg-border" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">Amount to Pay</span>
                                <span className="text-lg font-black text-indigo-700">{currency}{claim.bankTransfer.amount.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Includes Paga&apos;s transfer fee — send exactly this amount.</p>
                        </div>
                    </Card>

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs font-bold text-muted-foreground">OR</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <Button type="button" variant="outline" onClick={handlePayWithCard} disabled={isPayingWithCard} className="w-full border-indigo-600 py-3 text-indigo-600 hover:bg-indigo-50">
                        {isPayingWithCard ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                        Pay With Card — {currency}{claim.cardPayment.amount.toLocaleString()}
                    </Button>
                    <p className="-mt-2 text-center text-xs text-muted-foreground">
                        Includes a {claim.cardPayment.chargePercent}% card processing fee ({currency}{(claim.cardPayment.amount - claim.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} extra).
                    </p>

                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                        <Loader2 size={14} className="shrink-0 animate-spin" />
                        Waiting for payment confirmation — this page updates automatically once we receive it.
                    </div>
                </div>
            )}
        </div>
    );
}
