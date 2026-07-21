'use client';

import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEndEarlyMutation } from '@/store/api/auctionApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SellerBidRow } from './SellerBidRow';
import { CountdownTimer } from './CountdownTimer';
import type { AuctionListing } from '@/types';
import { formatGkwth } from '@/lib/utils';

export function ActiveAuctionCard({ auction }: { auction: AuctionListing }) {
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
        <Card className="gap-0 overflow-hidden py-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                    <div className="text-sm font-semibold text-foreground">Auction #{auction.id} — {formatGkwth(auction.gkwthAmount)} GKWTH</div>
                    <div className="text-xs text-muted-foreground">
                        {isAwaitingPayment
                            ? 'Waiting for the buyer to complete payment'
                            : `Ends ${formatDistanceToNow(new Date(auction.endsAt), { addSuffix: true })}`}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {auction.status === 'active' && <CountdownTimer endsAt={auction.endsAt} />}
                    {isAwaitingPayment && auction.claimDeadlineAt && <CountdownTimer endsAt={auction.claimDeadlineAt} />}
                    {auction.status === 'active' && (
                        <Button type="button" variant="destructive" size="sm" onClick={handleEndEarly} disabled={isEnding}>
                            {isEnding && <Loader2 size={12} className="animate-spin" />} End Early
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
                {[
                    ['GKWTH Amount', formatGkwth(auction.gkwthAmount)],
                    ['Top Bid', `${currency}${(auction.currentTopBid / 1000).toFixed(0)}k`],
                    ['Total Bids', auction.bidCount],
                    ['Bidders', auction.bidderCount],
                ].map(([label, value], i) => (
                    <div key={label as string} className={`p-4 ${i < 3 ? 'border-r border-border' : ''}`}>
                        <div className="mb-1 text-xs text-muted-foreground">{label}</div>
                        <div className="text-lg font-bold text-foreground">{value}</div>
                    </div>
                ))}
            </div>

            <div>
                <div className="border-b border-border bg-muted/40 px-5 py-3.5 text-xs font-semibold text-foreground">
                    {isAwaitingPayment ? 'Winning Bid — awaiting buyer payment' : 'All Bids — You can accept any bid at any time'}
                </div>
                {(auction.bids || []).length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No bids yet.</div>
                ) : (
                    (auction.bids || [])
                        .filter((b) => b.status !== 'refunded' && b.status !== 'rejected')
                        .map((bid) => <SellerBidRow key={bid.id} listingId={auction.id} bid={bid} isTop={bid.id === topBidId} />)
                )}
            </div>
        </Card>
    );
}
