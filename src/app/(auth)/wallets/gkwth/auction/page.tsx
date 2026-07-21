'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, History, Gavel } from 'lucide-react';
import { useGetAuctionsQuery } from '@/store/api/auctionApi';
import { AuctionCard } from '@/components/auctions/AuctionCard';
import { AuctionPageHeader } from '@/components/auctions/AuctionPageHeader';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LoadingScreen from '@/components/LoadingScreen';
import { useDebounce } from '@/hooks/use-debounce';
import { useAppSelector } from '@/store/hooks';

const FILTERS = [
    { label: 'All', sort: undefined },
    { label: 'Ending Soon', sort: 'ending_soon' },
    { label: 'Lowest Price', sort: 'lowest_bid' },
    { label: 'Most Bids', sort: 'most_bids' },
];

const HOW_IT_WORKS = [
    { icon: '📋', title: '1. List GKWTH', desc: 'Set amount, starting bid & auction duration' },
    { icon: '🏷️', title: '2. Bids Come In', desc: 'Community members place competing bids in real-time' },
    { icon: '✅', title: '3. You Accept', desc: 'Review all bids and accept the one you want' },
    { icon: '💰', title: '4. Instant Transfer', desc: 'Buyer gets GKWTH, you receive the payment' },
];

export default function AuctionBrowsePage() {
    const currentUser = useAppSelector((state) => state.auth.user);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const debouncedSearch = useDebounce(search, 400);
    const filter = FILTERS.find((f) => f.label === activeFilter);

    const { data, isLoading } = useGetAuctionsQuery({ status: 'active', search: debouncedSearch || undefined, sort: filter?.sort });
    const auctions = data?.data?.data || [];

    const liveCount = auctions.length;

    if (isLoading) return <LoadingScreen />;

    return (
        <div className="space-y-8">
            <AuctionPageHeader
                eyebrow="GKWTH Marketplace"
                title={<>Auction <span className="text-indigo-600">Marketplace</span></>}
                description="Buy and bid on GKWTH offered directly by community members. Win the auction, get the GKWTH instantly."
                stats={[{ label: 'Active Auctions Live Now', value: liveCount }]}
                action={
                    <>
                        <Link href="/wallets/gkwth/auction/my?tab=create" className={cn(buttonVariants(), 'bg-indigo-600 text-white hover:bg-indigo-700')}>
                            <Plus size={16} strokeWidth={2.5} /> List My GKWTH
                        </Link>
                        <Link href="/wallets/gkwth/auction/my" className={cn(buttonVariants({ variant: 'outline' }))}>
                            <Gavel size={16} strokeWidth={2.5} /> My Auctions
                        </Link>
                        <Link href="/wallets/gkwth/auction/bids" className={cn(buttonVariants({ variant: 'outline' }))}>
                            <History size={16} strokeWidth={2.5} /> My Bids
                        </Link>
                    </>
                }
            />

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex min-w-[200px] max-w-xs flex-1 items-center gap-2 rounded-xl border-[1.5px] border-border bg-card px-3.5 focus-within:border-indigo-400">
                    <Search size={15} className="shrink-0 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search auctions…"
                        className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                </div>
                {FILTERS.map((f) => (
                    <button
                        key={f.label}
                        onClick={() => setActiveFilter(f.label)}
                        className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-all ${
                            activeFilter === f.label
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-border bg-card text-foreground hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {auctions.map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} currentUserId={currentUser?.id} />
                ))}

                {/* <Link
                    href="/wallets/gkwth/auction/my?tab=create"
                    className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-6 text-center transition-all hover:border-indigo-400"
                >
                    <div className="flex items-center justify-center mb-4 bg-indigo-100 h-15 w-15 rounded-2xl">
                        <Plus size={28} className="text-indigo-600" />
                    </div>
                    <div className="mb-1.5 text-base font-bold text-indigo-700">List Your GKWTH</div>
                    <div className="text-sm text-indigo-500">Set a price, open bidding, and sell to the highest bidder you approve</div>
                </Link> */}
            </div>

            {auctions.length === 0 && (
                <div className="py-16 text-sm text-center border rounded-2xl border-border bg-card text-muted-foreground">
                    No auctions found. Be the first to list your GKWTH!
                </div>
            )}

            {/* <Card className="gap-0 py-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <div className="text-sm font-semibold text-foreground">How GKWTH Auctions Work</div>
                    <div className="text-xs text-muted-foreground">A secure, peer-to-peer GKWTH marketplace</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {HOW_IT_WORKS.map((step, index) => (
                        <div key={step.title} className={`p-6 text-center ${index < HOW_IT_WORKS.length - 1 ? 'lg:border-r border-border' : ''}`}>
                            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-xl">{step.icon}</div>
                            <div className="mb-1.5 text-sm font-semibold text-foreground">{step.title}</div>
                            <div className="text-xs leading-relaxed text-muted-foreground">{step.desc}</div>
                        </div>
                    ))}
                </div>
            </Card> */}
        </div>
    );
}
