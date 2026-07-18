'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetMyAuctionsQuery, useEndEarlyMutation } from '@/store/api/auctionApi';
import { SellerBidRow } from '@/components/auctions/SellerBidRow';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import LoadingScreen from '@/components/LoadingScreen';
import type { AuctionListing } from '@/types';

function ActiveAuctionCard({ auction }: { auction: AuctionListing }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const [endEarly, { isLoading: isEnding }] = useEndEarlyMutation();

    const topBidId = auction.bids && auction.bids.length > 0
        ? [...auction.bids].filter((b) => b.status === 'pending' || b.status === 'superseded').sort((a, b) => b.amount - a.amount)[0]?.id
        : undefined;

    const handleEndEarly = async () => {
        try {
            await endEarly(auction.id).unwrap();
            toast.success('Auction ended');
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to end auction');
        }
    };

    const isAwaitingPayment = auction.status === 'awaiting_payment';

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                <div>
                    <div className="text-sm font-bold text-zinc-900">Auction #{auction.id} — {auction.gkwthAmount} GKWTH</div>
                    <div className="text-xs text-zinc-400">
                        {isAwaitingPayment
                            ? 'Waiting for the buyer to complete payment'
                            : `Ends ${formatDistanceToNow(new Date(auction.endsAt), { addSuffix: true })}`}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {auction.status === 'active' && <CountdownTimer endsAt={auction.endsAt} />}
                    {isAwaitingPayment && auction.claimDeadlineAt && <CountdownTimer endsAt={auction.claimDeadlineAt} />}
                    {auction.status === 'active' && (
                        <button
                            onClick={handleEndEarly}
                            disabled={isEnding}
                            className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-200 disabled:opacity-50"
                        >
                            {isEnding && <Loader2 size={12} className="animate-spin" />} End Early
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 border-b border-zinc-100 sm:grid-cols-4">
                {[
                    ['GKWTH Amount', auction.gkwthAmount],
                    ['Top Bid', `${currency}${(auction.currentTopBid / 1000).toFixed(0)}k`],
                    ['Total Bids', auction.bidCount],
                    ['Bidders', auction.bidderCount],
                ].map(([label, value], i) => (
                    <div key={label as string} className={`p-4 ${i < 3 ? 'border-r border-zinc-100' : ''}`}>
                        <div className="mb-1 text-xs text-zinc-400">{label}</div>
                        <div className="text-lg font-black text-zinc-900">{value}</div>
                    </div>
                ))}
            </div>

            <div>
                <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3.5 text-xs font-semibold text-zinc-700">
                    {isAwaitingPayment ? 'Winning Bid — awaiting buyer payment' : 'All Bids — You can accept any bid at any time'}
                </div>
                {(auction.bids || []).length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-zinc-400">No bids yet.</div>
                ) : (
                    (auction.bids || [])
                        .filter((b) => b.status !== 'refunded' && b.status !== 'rejected')
                        .map((bid) => <SellerBidRow key={bid.id} listingId={auction.id} bid={bid} isTop={bid.id === topBidId} />)
                )}
            </div>
        </div>
    );
}

export default function MyAuctionsPage() {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const { data, isLoading } = useGetMyAuctionsQuery();

    if (isLoading) return <LoadingScreen />;

    const result = data?.data;
    const active = result?.active || [];
    const past = result?.past || [];
    const stats = result?.stats;

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-[#1a1060] p-8">
                <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="relative z-10">
                    <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur">
                        📋 Seller Dashboard
                    </div>
                    <h1 className="mb-3 text-2xl font-black text-white md:text-3xl">
                        My <span className="text-indigo-300">GKWTH</span> Auctions
                    </h1>
                    <p className="mb-6 max-w-lg text-sm text-white/60">Manage your active listings and review incoming bids to accept.</p>
                    <Link
                        href="/wallets/gkwth/auction/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                    >
                        <Plus size={14} strokeWidth={2.5} /> New Auction
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                    { icon: '🔴', label: 'Active Auctions', value: stats?.activeCount ?? 0, bg: 'bg-indigo-100' },
                    { icon: '🏷️', label: 'Total Bids Received', value: stats?.totalBidsReceived ?? 0, bg: 'bg-amber-100' },
                    { icon: '💰', label: 'Total Earned (All Time)', value: `${currency}${(stats?.totalEarnedAllTime ?? 0).toLocaleString()}`, bg: 'bg-emerald-100' },
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

            <div className="space-y-6">
                {active.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white py-12 text-center text-sm text-zinc-400">
                        You have no active auctions. <Link href="/wallets/gkwth/auction/create" className="font-semibold text-indigo-600">List your GKWTH →</Link>
                    </div>
                ) : (
                    active.map((auction) => <ActiveAuctionCard key={auction.id} auction={auction} />)
                )}
            </div>

            {past.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <div className="border-b border-zinc-100 px-5 py-4">
                        <div className="text-sm font-bold text-zinc-900">Past Auctions</div>
                    </div>
                    <div>
                        {past.map((auction) => {
                            const tx = auction.transactions?.[0];
                            return (
                                <div key={auction.id} className="flex items-center gap-3.5 border-b border-zinc-100 px-5 py-3.5 last:border-none">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-base">
                                        {auction.status === 'completed' ? '✓' : '✕'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-semibold text-zinc-900">{auction.gkwthAmount} GKWTH — Auction #{auction.id}</div>
                                        <div className="text-xs text-zinc-400">
                                            {formatDistanceToNow(new Date(auction.createdAt), { addSuffix: true })} · {auction.status === 'completed' ? `${auction.bidCount} total bids` : 'Cancelled'}
                                        </div>
                                    </div>
                                    {tx && (
                                        <div className="text-right">
                                            <div className="text-sm font-black text-emerald-500">+{currency}{tx.netAmount.toLocaleString()}</div>
                                            <div className="text-xs text-zinc-400">Received</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
