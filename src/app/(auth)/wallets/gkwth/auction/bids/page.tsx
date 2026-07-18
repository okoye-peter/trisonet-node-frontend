'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Gavel } from 'lucide-react';
import { useGetMyBidHistoryQuery } from '@/store/api/auctionApi';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import { AuctionAvatar } from '@/components/auctions/AuctionAvatar';
import LoadingScreen from '@/components/LoadingScreen';
import type { AuctionBidOutcome } from '@/types';

const FILTERS: { label: string; value: AuctionBidOutcome | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Awaiting Payment', value: 'awaiting_payment' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
];

const OUTCOME_STYLES: Record<AuctionBidOutcome, string> = {
    active: 'bg-amber-100 text-amber-700',
    pending: 'bg-blue-100 text-blue-700',
    awaiting_payment: 'bg-amber-100 text-amber-700',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-zinc-100 text-zinc-500',
};

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
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-[#1a1060] p-8">
                <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="relative z-10">
                    <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur">
                        🏷️ Bidder History
                    </div>
                    <h1 className="mb-3 text-2xl font-black text-white md:text-3xl">
                        My <span className="text-indigo-300">GKWTH</span> Bids
                    </h1>
                    <p className="max-w-lg text-sm text-white/60">Track every auction you&apos;ve bid on, what you won, and what got away.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                    { icon: '🔴', label: 'Active Bids', value: stats?.activeBidsCount ?? 0, bg: 'bg-amber-100' },
                    { icon: '🏆', label: 'Auctions Won', value: stats?.wonCount ?? 0, bg: 'bg-emerald-100' },
                    { icon: '💸', label: 'Total Spent', value: `${currency}${(stats?.totalSpent ?? 0).toLocaleString()}`, bg: 'bg-indigo-100' },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${s.bg}`}>{s.icon}</div>
                        <div>
                            <div className="text-2xl font-black text-zinc-900">{s.value}</div>
                            <div className="text-xs font-medium text-zinc-400">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-all ${
                            activeFilter === f.value
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                {bids.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center text-zinc-400">
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
                            className="flex flex-wrap items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-none hover:bg-zinc-50"
                        >
                            <AuctionAvatar name={auction.seller?.name || '?'} className="h-10 w-10 text-sm" />

                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-zinc-900">
                                    {auction.gkwthAmount} GKWTH — Auction #{auction.id}
                                </div>
                                <div className="text-xs text-zinc-400">
                                    Seller {auction.seller?.name} · {formatDistanceToNow(new Date(auction.createdAt), { addSuffix: true })}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-black text-zinc-900">{currency}{auction.yourBid.toLocaleString()}</div>
                                <div className="text-xs text-zinc-400">Your bid</div>
                            </div>

                            {auction.outcome === 'active' ? (
                                <CountdownTimer endsAt={auction.endsAt} />
                            ) : auction.outcome === 'awaiting_payment' ? (
                                <div className="flex items-center gap-2">
                                    {auction.claimDeadlineAt && <CountdownTimer endsAt={auction.claimDeadlineAt} />}
                                    <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-white">Claim & Pay</span>
                                </div>
                            ) : (
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${OUTCOME_STYLES[auction.outcome]}`}>
                                    {auction.outcome}
                                </span>
                            )}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
