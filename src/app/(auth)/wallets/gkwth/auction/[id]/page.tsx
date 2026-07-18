'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useGetAuctionQuery, useEndEarlyMutation } from '@/store/api/auctionApi';
import { useAppSelector } from '@/store/hooks';
import { AuctionAvatar } from '@/components/auctions/AuctionAvatar';
import { CountdownBlocks } from '@/components/auctions/CountdownTimer';
import { BidHistoryList } from '@/components/auctions/BidHistoryList';
import { SellerBidRow } from '@/components/auctions/SellerBidRow';
import { BidPanel } from '@/components/auctions/BidPanel';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import LoadingScreen from '@/components/LoadingScreen';

const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Scheduled',
    active: 'Live',
    ended: 'Ended',
    awaiting_payment: 'Awaiting Payment',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function AuctionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const user = useAppSelector((state) => state.auth.user);

    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(interval);
    }, []);

    const { data, isLoading } = useGetAuctionQuery(id);
    const auction = data?.data;
    const [endEarly, { isLoading: isEnding }] = useEndEarlyMutation();

    if (isLoading) return <LoadingScreen />;
    if (!auction) return <div className="py-16 text-center text-zinc-400">Auction not found.</div>;

    const isSeller = user?.id === auction.sellerId;
    // Auth hydrates asynchronously (user can be briefly null right after login), so treat
    // "we don't know who's viewing yet" the same as "assume seller" — never show bidding
    // controls until we've positively confirmed the viewer is someone else.
    const canBid = !!user && !isSeller;
    const isActive = auction.status === 'active';
    const topBidId = auction.bids && auction.bids.length > 0
        ? [...auction.bids].filter((b) => b.status === 'pending' || b.status === 'superseded').sort((a, b) => b.amount - a.amount)[0]?.id
        : undefined;
    const winningBid = auction.bids?.find((b) => b.id === auction.acceptedBidId);
    const isAwaitingPayment = auction.status === 'awaiting_payment';
    const isWinningBidder = isAwaitingPayment && winningBid?.bidderId === user?.id;

    const handleEndEarly = async () => {
        try {
            await endEarly(auction.id).unwrap();
            toast.success('Auction ended');
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to end auction');
        }
    };
    const progressPct = Math.min(100, Math.max(0,
        ((now - new Date(auction.startsAt).getTime()) / (new Date(auction.endsAt).getTime() - new Date(auction.startsAt).getTime())) * 100
    ));

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-[#1a1060] p-8">
                <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="relative z-10 flex flex-wrap items-center gap-6">
                    <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2.5">
                            {isActive ? (
                                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> LIVE
                                </span>
                            ) : (
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">{STATUS_LABELS[auction.status] || auction.status}</span>
                            )}
                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">{auction.bidCount} Bids</span>
                            {winningBid && (
                                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                                    🏆 Won by {isSeller ? winningBid.bidder?.name : winningBid.bidderId === user?.id ? 'you' : winningBid.bidder?.name}
                                </span>
                            )}
                            <span className="text-xs text-white/40">Auction #{auction.id}</span>
                        </div>
                        <h1 className="text-3xl font-black text-white md:text-4xl">
                            {auction.gkwthAmount} <span className="text-indigo-300">GKWTH</span> Auction
                        </h1>
                        <div className="mt-3 flex items-center gap-2.5">
                            <AuctionAvatar name={auction.seller?.name || '?'} className="h-8 w-8 text-xs" />
                            <span className="text-sm text-white/70">
                                Listed by <strong className="text-white">{auction.seller?.name}</strong>
                            </span>
                        </div>
                    </div>
                    {isActive && (
                        <div>
                            <CountdownBlocks endsAt={auction.endsAt} />
                            <div className="mt-2 text-center text-xs text-white/40">Time Remaining</div>
                            {isSeller && (
                                <button
                                    type="button"
                                    onClick={handleEndEarly}
                                    disabled={isEnding}
                                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300 transition-all hover:bg-red-500/30 disabled:opacity-50"
                                >
                                    {isEnding && <Loader2 size={12} className="animate-spin" />} End Early
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isWinningBidder && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div>
                        <div className="text-sm font-black text-amber-900">You won this auction! 🎉</div>
                        <div className="text-xs text-amber-700">
                            Claim it and complete payment before the window closes, or it goes back to the seller.
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {auction.claimDeadlineAt && <CountdownTimer endsAt={auction.claimDeadlineAt} />}
                        <Link
                            href={`/wallets/gkwth/auction/${auction.id}/claim`}
                            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-600"
                        >
                            Claim & Pay
                        </Link>
                    </div>
                </div>
            )}

            {isAwaitingPayment && isSeller && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
                    <div>
                        <div className="text-sm font-black text-zinc-900">Waiting for buyer payment</div>
                        <div className="text-xs text-zinc-400">
                            {winningBid?.bidder?.name || 'The winning bidder'} has until the deadline to pay, otherwise your GKWTH is returned automatically.
                        </div>
                    </div>
                    {auction.claimDeadlineAt && <CountdownTimer endsAt={auction.claimDeadlineAt} />}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3">
                            <div className="p-4 sm:border-r border-zinc-100">
                                <div className="mb-1 text-xs font-medium text-zinc-400">Current Top Bid</div>
                                <div className="text-2xl font-black text-indigo-700">{currency}{auction.currentTopBid.toLocaleString()}</div>
                                <div className="text-xs text-zinc-400">≈ {currency}{(auction.currentTopBid / auction.gkwthAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })} / GKWTH</div>
                            </div>
                            <div className="p-4 sm:border-r border-zinc-100">
                                <div className="mb-1 text-xs font-medium text-zinc-400">Starting Bid</div>
                                <div className="text-lg font-bold text-zinc-700">{currency}{auction.startingBid.toLocaleString()}</div>
                            </div>
                            <div className="p-4">
                                <div className="mb-1 text-xs font-medium text-zinc-400">Total Bidders</div>
                                <div className="text-lg font-bold text-zinc-700">{auction.bidderCount} people</div>
                                <div className="text-xs text-zinc-400">{auction.bidCount} total bids placed</div>
                            </div>
                        </div>
                        {isActive && (
                            <>
                                <div className="mt-4 mb-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                                    <div className="h-full rounded-full bg-linear-to-r from-indigo-500 to-indigo-600" style={{ width: `${progressPct}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>{format(new Date(auction.startsAt), 'MMM d, h:mm a')}</span>
                                    <span>{format(new Date(auction.endsAt), 'MMM d, h:mm a')}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                            <div>
                                <div className="text-sm font-bold text-zinc-900">{isSeller ? 'Manage Bids' : 'Bid History'}</div>
                                <div className="text-xs text-zinc-400">
                                    {isSeller ? 'You can accept any bid at any time' : `${auction.bidCount} bids from ${auction.bidderCount} bidders`}
                                </div>
                            </div>
                            {isActive && <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-600">Live</span>}
                        </div>
                        {isSeller ? (
                            (auction.bids || []).filter((b) => b.status !== 'refunded' && b.status !== 'rejected').length === 0 ? (
                                <div className="px-5 py-10 text-center text-sm text-zinc-400">No bids yet.</div>
                            ) : (
                                (auction.bids || [])
                                    .filter((b) => b.status !== 'refunded' && b.status !== 'rejected')
                                    .map((bid) => <SellerBidRow key={bid.id} listingId={auction.id} bid={bid} isTop={bid.id === topBidId} />)
                            )
                        ) : (
                            <BidHistoryList bids={auction.bids || []} currentUserId={user?.id} />
                        )}
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white">
                        <div className="border-b border-zinc-100 px-5 py-4">
                            <div className="text-sm font-bold text-zinc-900">Auction Details</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-5">
                            {[
                                ['Auction ID', `#${auction.id}`],
                                ['Listed At', format(new Date(auction.createdAt), 'MMM d, h:mm a')],
                                ['Ends At', format(new Date(auction.endsAt), 'MMM d, h:mm a')],
                                ['Buy It Now', auction.buyItNowPrice ? `${currency}${auction.buyItNowPrice.toLocaleString()}` : '—'],
                                ...(winningBid ? [['Winner', winningBid.bidder?.name || '—']] : []),
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <div className="mb-1 text-xs text-zinc-400">{label}</div>
                                    <div className="text-sm font-semibold text-zinc-900">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {canBid && <BidPanel auction={auction} />}

                    {canBid && auction.yourStanding && (
                        <div className="rounded-2xl border border-zinc-200 bg-white">
                            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                                <div className="text-sm font-bold text-zinc-900">Your Standing</div>
                                {auction.yourStanding.isOutbid && (
                                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Outbid</span>
                                )}
                            </div>
                            <div className="space-y-3 p-5">
                                {auction.yourStanding.isOutbid && (
                                    <div className="flex items-center gap-3 rounded-xl bg-amber-100 p-3">
                                        <span className="text-lg">⚠️</span>
                                        <div>
                                            <div className="text-sm font-bold text-amber-900">You&apos;ve been outbid!</div>
                                            <div className="text-xs text-amber-700">
                                                Your last bid was {currency}{auction.yourStanding.lastBidAmount.toLocaleString()}. Current top is {currency}{auction.currentTopBid.toLocaleString()}.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-400">Your Last Bid</span>
                                    <span className="font-bold text-zinc-900">{currency}{auction.yourStanding.lastBidAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-400">Your Position</span>
                                    <span className="font-bold text-amber-500">#{auction.yourStanding.position} of {auction.yourStanding.totalBidders}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-400">Total Bids Placed</span>
                                    <span className="font-bold text-zinc-900">{auction.yourStanding.totalBidsPlaced} bids</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-zinc-200 bg-white">
                        <div className="border-b border-zinc-100 px-5 py-4">
                            <div className="text-sm font-bold text-zinc-900">About the Seller</div>
                        </div>
                        <div className="p-5">
                            <div className="mb-4 flex items-center gap-3.5">
                                <AuctionAvatar name={auction.seller?.name || '?'} className="h-13 w-13 text-lg" />
                                <div>
                                    <div className="text-base font-bold text-zinc-900">{auction.seller?.name}</div>
                                    <div className="text-xs text-zinc-400">Verified seller</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="rounded-lg bg-zinc-50 p-3 text-center">
                                    <div className="text-lg font-black text-zinc-900">{auction.sellerStats?.completedAuctions ?? 0}</div>
                                    <div className="text-xs text-zinc-400">Completed</div>
                                </div>
                                <div className="rounded-lg bg-zinc-50 p-3 text-center">
                                    <div className="text-lg font-black text-zinc-900">{isSeller ? 'You' : 'P2P'}</div>
                                    <div className="text-xs text-zinc-400">Seller</div>
                                </div>
                            </div>
                            {canBid && (
                                <Link
                                    href={`/talkzone?friend=${auction.sellerId}&name=${encodeURIComponent(auction.seller?.name || '')}`}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-600 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
                                >
                                    <MessageCircle size={15} /> Message Seller
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
