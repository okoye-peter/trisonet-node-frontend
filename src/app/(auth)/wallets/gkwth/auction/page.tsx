'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, History, Gavel } from 'lucide-react';
import { useGetAuctionsQuery } from '@/store/api/auctionApi';
import { AuctionCard } from '@/components/auctions/AuctionCard';
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
    { icon: '📋', title: '1. List GKWTH', desc: 'Set amount, starting bid & auction duration', bg: 'bg-indigo-50' },
    { icon: '🏷️', title: '2. Bids Come In', desc: 'Community members place competing bids in real-time', bg: 'bg-amber-100' },
    { icon: '✅', title: '3. You Accept', desc: 'Review all bids and accept the one you want', bg: 'bg-emerald-100' },
    { icon: '💰', title: '4. Instant Transfer', desc: 'Buyer gets GKWTH, you receive the payment', bg: 'bg-indigo-100' },
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
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-[#1a1060] p-8 md:p-12">
                <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 left-[10%] h-60 w-60 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="relative z-10">
                    <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> {liveCount} Active Auctions Live Now
                    </div>
                    <h1 className="mb-3 text-3xl leading-tight font-black text-white md:text-4xl">
                        GKWTH <span className="text-indigo-300">Auction</span> Marketplace
                    </h1>
                    <p className="mb-8 max-w-lg text-sm leading-relaxed text-white/60">
                        Buy and bid on GKWTH offered directly by community members. Win the auction, get the GKWTH instantly.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/wallets/gkwth/auction/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700"
                        >
                            <Plus size={16} strokeWidth={2.5} /> List My GKWTH
                        </Link>
                        <Link
                            href="/wallets/gkwth/auction/my"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
                        >
                            <Gavel size={16} strokeWidth={2.5} /> My Auctions
                        </Link>
                        <Link
                            href="/wallets/gkwth/auction/bids"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
                        >
                            <History size={16} strokeWidth={2.5} /> My Bids
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex min-w-[200px] max-w-xs flex-1 items-center gap-2 rounded-xl border-[1.5px] border-zinc-200 bg-white px-3.5 focus-within:border-indigo-400">
                    <Search size={15} className="shrink-0 text-zinc-400" />
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
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-indigo-400 hover:text-indigo-600'
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

                <Link
                    href="/wallets/gkwth/auction/create"
                    className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-6 text-center transition-all hover:border-indigo-400"
                >
                    <div className="mb-4 flex h-15 w-15 items-center justify-center rounded-2xl bg-indigo-100">
                        <Plus size={28} className="text-indigo-600" />
                    </div>
                    <div className="mb-1.5 text-base font-bold text-indigo-700">List Your GKWTH</div>
                    <div className="text-sm text-indigo-500">Set a price, open bidding, and sell to the highest bidder you approve</div>
                </Link>
            </div>

            {auctions.length === 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-400">
                    No auctions found. Be the first to list your GKWTH!
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-4">
                    <div className="text-sm font-bold text-zinc-900">How GKWTH Auctions Work</div>
                    <div className="text-xs text-zinc-400">A secure, peer-to-peer GKWTH marketplace</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {HOW_IT_WORKS.map((step, index) => (
                        <div key={step.title} className={`p-6 text-center ${index < HOW_IT_WORKS.length - 1 ? 'lg:border-r border-zinc-100' : ''}`}>
                            <div className={`mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${step.bg}`}>{step.icon}</div>
                            <div className="mb-1.5 text-sm font-bold text-zinc-900">{step.title}</div>
                            <div className="text-xs leading-relaxed text-zinc-400">{step.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
