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
import { AuctionStatusBadge } from '@/components/auctions/AuctionStatusBadge';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';

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
    if (!auction) return <div className="py-16 text-center text-muted-foreground">Auction not found.</div>;

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
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
                <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2.5">
                        <AuctionStatusBadge status={auction.status} pulse={isActive} />
                        <Badge variant="outline">{auction.bidCount} Bids</Badge>
                        {winningBid && (
                            <Badge className="gap-1 bg-amber-100 text-amber-700">
                                🏆 Won by {isSeller ? winningBid.bidder?.name : winningBid.bidderId === user?.id ? 'you' : winningBid.bidder?.name}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">Auction #{auction.id}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                        {auction.gkwthAmount} <span className="text-indigo-600">GKWTH</span> Auction
                    </h1>
                    <div className="mt-3 flex items-center gap-2.5">
                        <AuctionAvatar name={auction.seller?.name || '?'} className="h-8 w-8 text-xs" />
                        <span className="text-sm text-muted-foreground">
                            Listed by <strong className="text-foreground">{auction.seller?.name}</strong>
                        </span>
                    </div>
                </div>
                {isActive && (
                    <div>
                        <CountdownBlocks endsAt={auction.endsAt} />
                        <div className="mt-2 text-center text-xs text-muted-foreground">Time Remaining</div>
                        {isSeller && (
                            <Button type="button" variant="destructive" size="sm" onClick={handleEndEarly} disabled={isEnding} className="mt-3 w-full">
                                {isEnding && <Loader2 size={12} className="animate-spin" />} End Early
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {isWinningBidder && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div>
                        <div className="text-sm font-bold text-amber-900">You won this auction! 🎉</div>
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
                <Card className="flex-row flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                        <div className="text-sm font-bold text-foreground">Waiting for buyer payment</div>
                        <div className="text-xs text-muted-foreground">
                            {winningBid?.bidder?.name || 'The winning bidder'} has until the deadline to pay, otherwise your GKWTH is returned automatically.
                        </div>
                    </div>
                    {auction.claimDeadlineAt && <CountdownTimer endsAt={auction.claimDeadlineAt} />}
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    <Card className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3">
                            <div className="p-4 sm:border-r border-border">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">Current Top Bid</div>
                                <div className="text-2xl font-black text-indigo-700">{currency}{auction.currentTopBid.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">≈ {currency}{(auction.currentTopBid / auction.gkwthAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })} / GKWTH</div>
                            </div>
                            <div className="p-4 sm:border-r border-border">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">Starting Bid</div>
                                <div className="text-lg font-bold text-foreground">{currency}{auction.startingBid.toLocaleString()}</div>
                            </div>
                            <div className="p-4">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">Total Bidders</div>
                                <div className="text-lg font-bold text-foreground">{auction.bidderCount} people</div>
                                <div className="text-xs text-muted-foreground">{auction.bidCount} total bids placed</div>
                            </div>
                        </div>
                        {isActive && (
                            <>
                                <div className="mt-4 mb-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full rounded-full bg-linear-to-r from-indigo-500 to-indigo-600" style={{ width: `${progressPct}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{format(new Date(auction.startsAt), 'MMM d, h:mm a')}</span>
                                    <span>{format(new Date(auction.endsAt), 'MMM d, h:mm a')}</span>
                                </div>
                            </>
                        )}
                    </Card>

                    <Card className="gap-0 overflow-hidden py-0">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <div className="text-sm font-semibold text-foreground">{isSeller ? 'Manage Bids' : 'Bid History'}</div>
                                <div className="text-xs text-muted-foreground">
                                    {isSeller ? 'You can accept any bid at any time' : `${auction.bidCount} bids from ${auction.bidderCount} bidders`}
                                </div>
                            </div>
                            {isActive && <AuctionStatusBadge status="active" />}
                        </div>
                        {isSeller ? (
                            (auction.bids || []).filter((b) => b.status !== 'refunded' && b.status !== 'rejected').length === 0 ? (
                                <div className="px-5 py-10 text-center text-sm text-muted-foreground">No bids yet.</div>
                            ) : (
                                (auction.bids || [])
                                    .filter((b) => b.status !== 'refunded' && b.status !== 'rejected')
                                    .map((bid) => <SellerBidRow key={bid.id} listingId={auction.id} bid={bid} isTop={bid.id === topBidId} />)
                            )
                        ) : (
                            <BidHistoryList bids={auction.bids || []} currentUserId={user?.id} />
                        )}
                    </Card>

                    <Card className="gap-0 py-0">
                        <div className="border-b border-border px-5 py-4">
                            <div className="text-sm font-semibold text-foreground">Auction Details</div>
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
                                    <div className="mb-1 text-xs text-muted-foreground">{label}</div>
                                    <div className="text-sm font-semibold text-foreground">{value}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    {canBid && <BidPanel auction={auction} />}

                    {canBid && auction.yourStanding && (
                        <Card className="gap-0 py-0">
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <div className="text-sm font-semibold text-foreground">Your Standing</div>
                                {auction.yourStanding.isOutbid && (
                                    <Badge className="bg-amber-100 text-amber-700">Outbid</Badge>
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
                                    <span className="text-muted-foreground">Your Last Bid</span>
                                    <span className="font-bold text-foreground">{currency}{auction.yourStanding.lastBidAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Your Position</span>
                                    <span className="font-bold text-amber-600">#{auction.yourStanding.position} of {auction.yourStanding.totalBidders}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Bids Placed</span>
                                    <span className="font-bold text-foreground">{auction.yourStanding.totalBidsPlaced} bids</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="gap-0 py-0">
                        <div className="border-b border-border px-5 py-4">
                            <div className="text-sm font-semibold text-foreground">About the Seller</div>
                        </div>
                        <div className="p-5">
                            <div className="mb-4 flex items-center gap-3.5">
                                <AuctionAvatar name={auction.seller?.name || '?'} className="h-13 w-13 text-lg" />
                                <div>
                                    <div className="text-base font-bold text-foreground">{auction.seller?.name}</div>
                                    <div className="text-xs text-muted-foreground">Verified seller</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="rounded-lg bg-muted/50 p-3 text-center">
                                    <div className="text-lg font-bold text-foreground">{auction.sellerStats?.completedAuctions ?? 0}</div>
                                    <div className="text-xs text-muted-foreground">Completed</div>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3 text-center">
                                    <div className="text-lg font-bold text-foreground">{isSeller ? 'You' : 'P2P'}</div>
                                    <div className="text-xs text-muted-foreground">Seller</div>
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
                    </Card>
                </div>
            </div>
        </div>
    );
}
