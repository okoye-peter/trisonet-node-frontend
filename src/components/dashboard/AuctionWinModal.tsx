'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useGetMyBidHistoryQuery } from '@/store/api/auctionApi';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
import { CountdownTimer } from '@/components/auctions/CountdownTimer';
import { formatGkwth } from '@/lib/utils';

const REOPEN_INTERVAL = 15 * 60 * 1000;

export default function AuctionWinModal() {
    useAuctionSocket();

    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const { data, refetch } = useGetMyBidHistoryQuery(
        { result: 'awaiting_payment' },
        { skip: !isAuthenticated }
    );

    const wins = (data?.data?.data ?? []).filter(
        (item) => item.claimDeadlineAt && new Date(item.claimDeadlineAt).getTime() > Date.now()
    );
    const current = wins[index];
    const isLast = index === wins.length - 1;

    // Open as soon as unclaimed wins load for the first time
    useEffect(() => {
        if (wins.length > 0) {
            setIndex(0);
            setOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wins.length]);

    // Re-open periodically as a reminder while the claim window is ticking down
    useEffect(() => {
        if (!isAuthenticated) return;

        const id = setInterval(() => {
            refetch();
            setIndex(0);
            setOpen(true);
        }, REOPEN_INTERVAL);

        return () => clearInterval(id);
    }, [isAuthenticated, refetch]);

    const handleNext = () => setIndex((i) => i + 1);
    const handleDismiss = () => setOpen(false);
    const handleClaim = () => {
        if (!current) return;
        setOpen(false);
        router.push(`/wallets/gkwth/auction/${current.id}/claim`);
    };

    if (!isAuthenticated || !current) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-amber-100">
                            <Trophy className="w-4 h-4 text-amber-600" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-base font-semibold leading-tight">
                                You Won the Auction!
                            </DialogTitle>
                            {wins.length > 1 && (
                                <span className="text-xs text-muted-foreground">
                                    {index + 1} of {wins.length}
                                </span>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-3 px-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your bid of ₦{current.yourBid.toLocaleString()} for {formatGkwth(current.gkwthAmount)} GKWTH won. Complete
                        payment before the timer runs out to claim your GKWTH — if it expires, you&apos;ll forfeit
                        the win and it won&apos;t be offered again.
                    </p>
                    <CountdownTimer endsAt={current.claimDeadlineAt as string} />
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={isLast ? handleDismiss : handleNext} className="w-full sm:w-auto">
                        {isLast ? 'Later' : 'Next'}
                    </Button>
                    <Button onClick={handleClaim} className="w-full sm:w-auto">
                        Claim Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
