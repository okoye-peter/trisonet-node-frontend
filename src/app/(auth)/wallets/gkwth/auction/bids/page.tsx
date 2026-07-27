'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Gavel, Loader2 } from 'lucide-react';
import { useGetMyBidHistoryQuery } from '@/store/api/auctionApi';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import { AuctionAvatar } from '@/components/auctions/AuctionAvatar';
import { AuctionStatusBadge } from '@/components/auctions/AuctionStatusBadge';
import { AuctionPageHeader } from '@/components/auctions/AuctionPageHeader';
import { Card } from '@/components/ui/card';
import LoadingScreen from '@/components/LoadingScreen';
import { formatGkwth } from '@/lib/utils';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { AuctionBidOutcome, MyBidHistoryItem } from '@/types';

const PAGE_SIZE = 15;

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

    const [page, setPage] = useState(1);
    const [bids, setBids] = useState<MyBidHistoryItem[]>([]);

    // Switching filters starts a fresh list from page 1.
    useEffect(() => {
        setPage(1);
        setBids([]);
    }, [activeFilter]);

    const { data, isLoading, isFetching } = useGetMyBidHistoryQuery({
        result: activeFilter === 'all' ? undefined : activeFilter,
        page,
        limit: PAGE_SIZE,
    });

    const result = data?.data;
    const stats = result?.stats;

    useEffect(() => {
        if (!result) return;
        setBids((prev) => (page === 1 ? result.data : [...prev, ...result.data]));
    }, [result, page]);

    const hasNextPage = result?.meta?.hasNextPage ?? false;
    const sentinelRef = useInfiniteScroll(() => setPage((p) => p + 1), hasNextPage, isFetching);

    if (isLoading && page === 1) return <LoadingScreen />;

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
                {bids.length === 0 && !isFetching ? (
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

            {hasNextPage && (
                <div ref={sentinelRef} className="flex items-center justify-center py-6">
                    <Loader2 size={18} className="animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
