'use client';

import { formatDistanceToNow } from 'date-fns';
import type { AuctionBid } from '@/types';
import { AuctionAvatar } from './AuctionAvatar';

const RANK_STYLES = [
    'bg-amber-100 text-amber-700',
    'bg-muted text-muted-foreground',
    'bg-orange-100 text-orange-700',
];

export function BidHistoryList({ bids, currentUserId }: { bids: AuctionBid[]; currentUserId?: string }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency

    if (bids.length === 0) {
        return <div className="px-5 py-10 text-center text-sm text-muted-foreground">No bids yet — be the first to bid.</div>;
    }

    const visibleBids = bids
        .filter((b) => b.status !== 'refunded' && b.status !== 'rejected')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="flex flex-col">
            {visibleBids.map((bid, index) => {
                const isWinner = bid.status === 'accepted';
                return (
                    <div
                        key={bid.id}
                        className={`flex items-center gap-3.5 border-b border-border px-5 py-3.5 last:border-none ${isWinner ? 'bg-amber-50' : bid.status === 'pending' && index === 0 ? 'bg-indigo-50' : ''}`}
                    >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isWinner ? 'bg-amber-100 text-amber-700' : RANK_STYLES[index] || 'bg-muted text-muted-foreground'}`}>
                            {isWinner ? '🏆' : index === 0 && bid.status === 'pending' ? '👑' : index + 1}
                        </div>
                        <AuctionAvatar name={bid.bidder?.name || '?'} className="h-8 w-8 text-xs" />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                                {bid.bidder?.name}
                                {bid.bidderId === currentUserId && (
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">You</span>
                                )}
                                {isWinner && (
                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Winner</span>
                                )}
                                {!isWinner && index === 0 && bid.status === 'pending' && (
                                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">Top Bidder</span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</div>
                        </div>
                        <div className="text-base font-bold text-indigo-700">{currency}{bid.amount.toLocaleString()}</div>
                    </div>
                );
            })}
        </div>
    );
}
