'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import type { AuctionListing } from '@/types';
import { AuctionAvatar } from './AuctionAvatar';
import { CountdownTimer } from './CountdownTimer';
import { AuctionStatusBadge } from './AuctionStatusBadge';
import { formatGkwth } from '@/lib/utils';

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
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100"
        >
            <div className="flex items-start justify-between gap-2 border-b border-border p-4">
                <div>
                    <div className="text-2xl font-bold text-foreground">{formatGkwth(auction.gkwthAmount)} GKWTH</div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">GKWTH for sale</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <AuctionStatusBadge status={auction.status} pulse={isActive} />
                    {isActive && <CountdownTimer endsAt={auction.endsAt} />}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex items-center gap-2.5">
                    <AuctionAvatar name={auction.seller?.name || '?'} className="h-8 w-8 text-xs" />
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{auction.seller?.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star size={10} className="fill-amber-400 text-amber-400" /> {auction.sellerStats?.completedAuctions ?? 0} auctions
                        </div>
                    </div>
                </div>

                <div className="mb-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-indigo-700">{currency}{auction.currentTopBid.toLocaleString()}</span>
                </div>
                <div className="mb-3 text-xs text-muted-foreground">
                    {isEnded ? `Final price · ${auction.bidCount} total bids` : `Min next: ${currency}${auction.minNextBid.toLocaleString()}`}
                </div>

                <div className="mb-3 flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <div className="text-center">
                        <div className="text-sm font-bold text-foreground">{auction.bidCount || '—'}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">Bids</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold text-foreground">{auction.bidderCount || '—'}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">Bidders</div>
                    </div>
                </div>

                <div
                    className={`mt-auto w-full rounded-xl py-2.5 text-center text-sm font-bold ${
                        isEnded
                            ? 'bg-muted text-muted-foreground'
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
