'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import type { AuctionListing } from '@/types';
import { AuctionAvatar } from './AuctionAvatar';
import { CountdownTimer } from './CountdownTimer';

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    scheduled: 'bg-amber-100 text-amber-700',
    ended: 'bg-zinc-100 text-zinc-500',
    completed: 'bg-indigo-100 text-indigo-700',
    cancelled: 'bg-zinc-100 text-zinc-400',
};

export function AuctionCard({ auction, currentUserId }: { auction: AuctionListing; currentUserId?: string }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const isActive = auction.status === 'active';
    const isEnded = auction.status === 'ended' || auction.status === 'completed' || auction.status === 'cancelled';
    const isOwn = !!currentUserId && currentUserId === auction.sellerId;
    // Auth hydrates asynchronously, so currentUserId can be briefly undefined right after
    // login — don't invite a bid until we've positively confirmed the viewer isn't the seller.
    const canBidOnThis = !!currentUserId && !isOwn;

    return (
        <Link
            href={`/wallets/gkwth/auction/${auction.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100"
        >
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 to-indigo-800 p-5">
                <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-indigo-400/20 blur-2xl" />
                <div className="relative z-10 mb-3 flex items-start justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[auction.status]}`}>
                        {auction.status}
                    </span>
                    {isActive && <CountdownTimer endsAt={auction.endsAt} />}
                </div>
                <div className="relative z-10 text-3xl font-black text-white">{auction.gkwthAmount} GKWTH</div>
                <div className="relative z-10 text-xs font-bold uppercase tracking-wide text-indigo-300">GKWTH for sale</div>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex items-center gap-2.5">
                    <AuctionAvatar name={auction.seller?.name || '?'} className="h-8 w-8 text-xs" />
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900">{auction.seller?.name}</div>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <Star size={10} className="fill-amber-400 text-amber-400" /> {auction.sellerStats?.completedAuctions ?? 0} auctions
                        </div>
                    </div>
                </div>

                <div className="mb-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-indigo-700">{currency}{auction.currentTopBid.toLocaleString()}</span>
                </div>
                <div className="mb-3 text-xs text-zinc-400">
                    {isEnded ? `Final price · ${auction.bidCount} total bids` : `Min next: ${currency}${auction.minNextBid.toLocaleString()}`}
                </div>

                <div className="mb-3 flex justify-between rounded-lg bg-zinc-50 px-3 py-2">
                    <div className="text-center">
                        <div className="text-sm font-bold text-zinc-900">{auction.bidCount || '—'}</div>
                        <div className="text-[10px] font-medium text-zinc-400">Bids</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold text-zinc-900">{auction.bidderCount || '—'}</div>
                        <div className="text-[10px] font-medium text-zinc-400">Bidders</div>
                    </div>
                </div>

                <div
                    className={`mt-auto w-full rounded-xl py-2.5 text-center text-sm font-bold ${
                        isEnded
                            ? 'bg-zinc-100 text-zinc-400'
                            : isOwn || auction.status === 'scheduled' || !canBidOnThis
                                ? 'border border-indigo-300 text-indigo-600'
                                : 'bg-indigo-600 text-white group-hover:bg-indigo-700'
                    }`}
                >
                    {isEnded
                        ? 'Auction Closed'
                        : isOwn
                            ? 'View Your Auction →'
                            : auction.status === 'scheduled'
                                ? 'Notify Me'
                                : canBidOnThis
                                    ? 'Place a Bid →'
                                    : 'View Auction →'}
                </div>
            </div>
        </Link>
    );
}
