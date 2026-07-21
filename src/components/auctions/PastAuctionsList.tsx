'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import type { AuctionListing } from '@/types';
import { formatGkwth } from '@/lib/utils';

export function PastAuctionsList({ auctions }: { auctions: AuctionListing[] }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency

    if (auctions.length === 0) return null;

    return (
        <Card className="gap-0 overflow-hidden py-0">
            <div className="border-b border-border px-5 py-4">
                <div className="text-sm font-semibold text-foreground">Past Auctions</div>
            </div>
            <div>
                {auctions.map((auction) => {
                    const tx = auction.transactions?.[0];
                    return (
                        <div key={auction.id} className="flex items-center gap-3.5 border-b border-border px-5 py-3.5 last:border-none">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-base">
                                {auction.status === 'completed' ? '✓' : '✕'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-foreground">{formatGkwth(auction.gkwthAmount)} GKWTH — Auction #{auction.id}</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(auction.createdAt), { addSuffix: true })} · {auction.status === 'completed' ? `${auction.bidCount} total bids` : 'Cancelled'}
                                </div>
                            </div>
                            {tx && (
                                <div className="text-right">
                                    <div className="text-sm font-bold text-emerald-600">+{currency}{tx.netAmount.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">Received</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
