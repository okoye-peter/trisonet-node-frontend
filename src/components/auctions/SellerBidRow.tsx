'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { AuctionBid } from '@/types';
import { AuctionAvatar } from './AuctionAvatar';
import { useAcceptBidMutation, useRejectBidMutation } from '@/store/api/auctionApi';

export function SellerBidRow({ listingId, bid, isTop }: { listingId: string; bid: AuctionBid; isTop: boolean }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const [acceptBid, { isLoading: isAccepting }] = useAcceptBidMutation();
    const [rejectBid, { isLoading: isRejecting }] = useRejectBidMutation();

    const isActionable = bid.status === 'pending' || bid.status === 'superseded';
    const isWinner = bid.status === 'accepted';

    const handleAccept = async () => {
        try {
            await acceptBid({ id: listingId, bidId: bid.id }).unwrap();
            toast.success('Bid accepted — the buyer has 48 hours to claim and pay');
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to accept bid');
        }
    };

    const handleReject = async () => {
        try {
            await rejectBid({ id: listingId, bidId: bid.id }).unwrap();
            toast.success('Bid declined');
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to reject bid');
        }
    };

    return (
        <div className={`flex items-center gap-3.5 border-b border-zinc-100 px-5 py-3.5 last:border-none ${isWinner ? 'bg-amber-50' : isTop ? 'bg-indigo-50' : ''}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${isWinner || isTop ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-400'}`}>
                {isWinner || isTop ? '🏆' : ''}
            </div>
            <AuctionAvatar name={bid.bidder?.name || '?'} className="h-8 w-8 text-xs" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-zinc-900">
                    {bid.bidder?.name}
                    {isWinner && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Winner</span>}
                    {!isWinner && isTop && <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">Highest</span>}
                </div>
                <div className="text-xs text-zinc-400">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</div>
            </div>
            <div className={`mr-3 text-base font-black ${isActionable || isWinner ? 'text-indigo-700' : 'text-zinc-400'}`}>
                {currency}{bid.amount.toLocaleString()}
            </div>
            {isActionable ? (
                <>
                    <Link
                        href={`/talkzone?friend=${bid.bidderId}&name=${encodeURIComponent(bid.bidder?.name || '')}`}
                        className="mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-zinc-100 hover:text-indigo-600"
                        title="Message bidder"
                    >
                        <MessageCircle size={14} />
                    </Link>
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={handleAccept}
                            disabled={isAccepting || isRejecting}
                            className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
                        >
                            {isAccepting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Accept
                        </button>
                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={isAccepting || isRejecting}
                            className="flex items-center justify-center rounded-lg bg-red-100 px-2.5 py-1.5 text-red-500 transition-all hover:bg-red-200 disabled:opacity-50"
                        >
                            {isRejecting ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                        </button>
                    </div>
                </>
            ) : !isWinner ? (
                <span className="text-xs font-medium text-zinc-400 capitalize">{bid.status}</span>
            ) : null}
        </div>
    );
}
