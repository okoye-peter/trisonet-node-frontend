'use client';

import { useState } from 'react';
import { Loader2, Tag, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { AuctionListing } from '@/types';
import { usePlaceBidMutation, useBuyItNowMutation } from '@/store/api/auctionApi';
import { useRouter } from 'next/navigation';

const QUICK_INCREMENTS = [1000, 5000, 10000, 20000];

export function BidPanel({ auction }: { auction: AuctionListing }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const router = useRouter();
    const [amount, setAmount] = useState<number>(0);
    const [placeBid, { isLoading: isBidding }] = usePlaceBidMutation();
    const [buyItNow, { isLoading: isBuying }] = useBuyItNowMutation();

    const isActive = auction.status === 'active';
    // No fixed increment — any amount is fine as long as it beats the current top bid
    // (or meets the starting bid, if nobody's bid yet).
    const meetsFloor = auction.bidCount > 0 ? amount > auction.currentTopBid : amount >= auction.currentTopBid;

    const handleBid = async () => {
        if (!meetsFloor) {
            toast.error(
                auction.bidCount > 0
                    ? `Your bid must be higher than the current top bid of ${currency}${auction.currentTopBid.toLocaleString()}`
                    : `Your bid must be at least the starting bid of ${currency}${auction.currentTopBid.toLocaleString()}`
            );
            return;
        }
        try {
            const result = await placeBid({ id: auction.id, amount }).unwrap();
            if (result.data?.status === 'accepted') {
                toast.success("Your bid met the set price — claim it and pay within 48 hours to get your GKWTH!");
                router.push(`/wallets/gkwth/auction/${auction.id}/claim`);
            } else {
                toast.success('Bid placed! No funds are held — you\'ll only pay if you win.');
            }
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to place bid');
        }
    };

    const handleBuyNow = async () => {
        try {
            await buyItNow(auction.id).unwrap();
            toast.success('You won! Claim it and pay within 48 hours to get your GKWTH.');
            router.push(`/wallets/gkwth/auction/${auction.id}/claim`);
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Purchase failed');
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-950 to-indigo-900 p-6">
            <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-indigo-400/15 blur-3xl" />

            <div className="relative z-10 mb-1 text-base font-black text-white">Place Your Bid</div>
            <div className="relative z-10 mb-5 text-xs text-white/50">
                {auction.bidCount > 0
                    ? `Current top: ${currency}${auction.currentTopBid.toLocaleString()} · your bid must beat it`
                    : `Starting bid: ${currency}${auction.currentTopBid.toLocaleString()} — name your price`}
                {auction.buyItNowPrice && (
                    <span className="block">A bid of {currency}{auction.buyItNowPrice.toLocaleString()} or more wins instantly.</span>
                )}
                <span className="block mt-1 text-white/35">Bidding is free — you only pay if you win, after you claim.</span>
            </div>

            <div className="relative z-10 mb-3 flex overflow-hidden rounded-xl border border-white/15 bg-white/8">
                <div className="flex items-center border-r border-white/10 bg-white/6 px-3.5 text-sm font-bold text-indigo-300">
                    {currency}
                </div>
                <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder={`More than ${auction.currentTopBid.toLocaleString()}`}
                    disabled={!isActive}
                    className="flex-1 bg-transparent px-3.5 py-3 font-bold text-white outline-none placeholder:text-white/30"
                />
            </div>

            <div className="relative z-10 mb-4 flex gap-2">
                {QUICK_INCREMENTS.map((inc) => {
                    const quickAmount = auction.currentTopBid + inc;
                    return (
                        <button
                            key={inc}
                            type="button"
                            disabled={!isActive}
                            onClick={() => setAmount(quickAmount)}
                            className="flex-1 rounded-lg border border-white/10 bg-white/8 py-2 text-center text-xs font-semibold text-indigo-300 transition-all hover:bg-white/15 hover:text-white disabled:opacity-40"
                        >
                            +{currency}{(inc / 1000).toFixed(0)}k
                            <div className="text-[10px] opacity-70">{quickAmount.toLocaleString()}</div>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleBid}
                disabled={!isActive || isBidding}
                className="relative z-10 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
                {isBidding ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
                {amount ? `Place Bid — ${currency}${amount.toLocaleString()}` : 'Place Bid'}
            </button>

            {/* {auction.buyItNowPrice && (
                <div className="relative z-10 mt-3">
                    <div className="mb-3 h-px bg-white/10" />
                    <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={!isActive || isBuying}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 py-3 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                        {isBuying ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        Buy It Now — {currency}{auction.buyItNowPrice.toLocaleString()}
                    </button>
                    <div className="mt-2 text-center text-[11px] text-white/35">Skip bidding · Pay to claim, instantly yours</div>
                </div>
            )} */}
        </div>
    );
}
