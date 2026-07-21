'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Gavel } from 'lucide-react';
import { useGetMyBidHistoryQuery } from '@/store/api/auctionApi';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import { AuctionAvatar } from '@/components/auctions/AuctionAvatar';
import { AuctionStatusBadge } from '@/components/auctions/AuctionStatusBadge';
import { AuctionPageHeader } from '@/components/auctions/AuctionPageHeader';
import { Card } from '@/components/ui/card';
import LoadingScreen from '@/components/LoadingScreen';
import { formatGkwth } from '@/lib/utils';
import type { AuctionBidOutcome } from '@/types';

const FILTERS: { label: string; value: AuctionBidOutcome | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Awaiting Payment', value: 'awaiting_payment' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
];

export default function MyBidsPage() {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const [activeFilter, setActiveFilter] = useState<AuctionBidOutcome | 'all'>('all');

    const { data, isLoading } = useGetMyBidHistoryQuery({ result: activeFilter === 'all' ? undefined : activeFilter });

    const result = data?.data;
    const bids = result?.data || [];
    const stats = result?.stats;

    if (isLoading) return <LoadingScreen />;

    return (
        <div className="space-y-8">
            <AuctionPageHeader
                eyebrow="Bidder History"
                title={<>My <span className="text-indigo-600">GKWTH</span> Bids</>}
                description="Track every auction you've bid on, what you won, and what got away."
                stats={[
                    { label: 'Active Bids', value: stats?.activeBidsCount ?? 0 },
                    { label: 'Auctions Won', value: stats?.wonCount ?? 0 },
                    { label: 'Total Spent', value: `${currency}${(stats?.totalSpent ?? 0).toLocaleString()}` },
                ]}
            />

            <div className="flex flex-wrap items-center gap-3">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-all ${
                            activeFilter === f.value
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-border bg-card text-foreground hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <Card className="gap-0 overflow-hidden py-0">
                {bids.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                        <Gavel size={32} strokeWidth={1.5} className="opacity-30" />
                        <p className="text-sm font-medium">No bids found for this filter.</p>
                        <Link href="/wallets/gkwth/auction" className="text-sm font-semibold text-indigo-600">
                            Browse active auctions →
                        </Link>
                    </div>
                ) : (
                    bids.map((auction) => (
                        <Link
                            key={auction.id}
                            href={
                                auction.outcome === 'awaiting_payment'
                                    ? `/wallets/gkwth/auction/${auction.id}/claim`
                                    : auction.outcome === 'won' && auction.transaction
                                        ? `/wallets/gkwth/auction/${auction.id}/won`
                                        : `/wallets/gkwth/auction/${auction.id}`
                            }
                            className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-4 last:border-none hover:bg-muted/40"
                        >
                            <AuctionAvatar name={auction.seller?.name || '?'} className="h-10 w-10 text-sm" />

                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-foreground">
                                    {formatGkwth(auction.gkwthAmount)} GKWTH — Auction #{auction.id}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Seller {auction.seller?.name} · {formatDistanceToNow(new Date(auction.createdAt), { addSuffix: true })}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-bold text-foreground">{currency}{auction.yourBid.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Your bid</div>
                            </div>

                            {auction.outcome === 'active' ? (
                                <CountdownTimer endsAt={auction.endsAt} />
                            ) : auction.outcome === 'awaiting_payment' ? (
                                <div className="flex items-center gap-2">
                                    {auction.claimDeadlineAt && <CountdownTimer endsAt={auction.claimDeadlineAt} />}
                                    <AuctionStatusBadge status="awaiting_payment" label="Claim & Pay" />
                                </div>
                            ) : (
                                <AuctionStatusBadge status={auction.outcome} />
                            )}
                        </Link>
                    ))
                )}
            </Card>
        </div>
    );
}
