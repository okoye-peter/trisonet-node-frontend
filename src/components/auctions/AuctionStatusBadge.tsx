import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AuctionStatus, AuctionBidOutcome } from '@/types';

type Status = AuctionStatus | AuctionBidOutcome;

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
    active: { label: 'Live', className: 'bg-emerald-100 text-emerald-700' },
    scheduled: { label: 'Scheduled', className: 'bg-amber-100 text-amber-700' },
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    awaiting_payment: { label: 'Awaiting Payment', className: 'bg-amber-100 text-amber-700' },
    won: { label: 'Won', className: 'bg-emerald-100 text-emerald-700' },
    completed: { label: 'Completed', className: 'bg-indigo-100 text-indigo-700' },
    ended: { label: 'Ended', className: 'bg-secondary text-secondary-foreground' },
    lost: { label: 'Lost', className: 'bg-secondary text-secondary-foreground' },
    cancelled: { label: 'Cancelled', className: 'bg-secondary text-secondary-foreground' },
};

/** Single source of truth for status → color/label across the auction feature. */
export function AuctionStatusBadge({
    status,
    label,
    pulse,
    className,
}: {
    status: Status;
    label?: string;
    pulse?: boolean;
    className?: string;
}) {
    const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-secondary text-secondary-foreground' };
    return (
        <Badge className={cn('gap-1.5 rounded-full px-2.5 py-1 font-bold uppercase tracking-wide', config.className, className)}>
            {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
            {label ?? config.label}
        </Badge>
    );
}
