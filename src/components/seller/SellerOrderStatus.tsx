'use client';

import { useState } from 'react';
import { Loader2, PackageCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatNaira } from '@/lib/shopUtils';
import { useUpdateSellerOrderStatusMutation } from '@/store/api/sellerApi';
import type { SellerOrder, SellerOrderStatus } from '@/types';

export const ORDER_STATUS_BADGE: Record<SellerOrderStatus, { label: string; className: string }> = {
    pending: { label: 'To ship', className: 'bg-amber-50 text-amber-700' },
    shipped: { label: 'Shipped', className: 'bg-blue-50 text-blue-700' },
    delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700' },
    cancelled: { label: 'Cancelled', className: 'bg-zinc-100 text-zinc-600' },
};

/** "Deliver by" countdown for an open order; red once the 14-day delivery deadline has passed. */
export function SellerOrderDeadline({ order }: { order: SellerOrder }) {
    if (!order.deliverBy) return null;
    const date = new Date(order.deliverBy).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
    if (order.isOverdue) {
        return <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-red-50 text-red-700">Overdue · was due {date}</span>;
    }
    const urgent = (order.daysLeftToDeliver ?? 0) <= 3;
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${urgent ? 'bg-orange-50 text-orange-700' : 'bg-zinc-100 text-zinc-600'}`}>
            Deliver by {date} · {order.daysLeftToDeliver} day{order.daysLeftToDeliver === 1 ? '' : 's'} left
        </span>
    );
}

export function SellerOrderStatusBadge({ status }: { status: SellerOrderStatus }) {
    const badge = ORDER_STATUS_BADGE[status];
    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>;
}

const ACTION = {
    shipped: {
        label: 'Mark as shipped',
        icon: Truck,
        title: 'Mark this order as shipped?',
        description: 'Only confirm once the items have left your hands. The buyer will be told their order is on its way.',
        confirmLabel: 'Yes, it has shipped',
        note: null,
        // Matches the 'Shipped' badge - the button is coloured by the status it moves the order to.
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        mediaClass: 'bg-blue-50 text-blue-600',
    },
    delivered: {
        label: 'Mark as delivered',
        icon: PackageCheck,
        title: 'Mark this order as delivered?',
        description: 'Only confirm once the buyer has received the items.',
        confirmLabel: 'Yes, it was delivered',
        note: 'This starts the buyer\'s 7-day return window and cannot be undone.',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        mediaClass: 'bg-emerald-50 text-emerald-600',
    },
} as const;

/** The single "move it forward" button for an order; renders nothing once the order is final. */
export function SellerOrderAction({ order, size = 'default' }: { order: SellerOrder; size?: 'default' | 'sm' }) {
    const [open, setOpen] = useState(false);
    const [updateStatus, { isLoading }] = useUpdateSellerOrderStatusMutation();
    if (!order.nextStatus) return null;

    const next = order.nextStatus;
    const action = ACTION[next];
    const Icon = action.icon;

    const handleConfirm = async () => {
        try {
            await updateStatus({ refNo: order.refNo, status: next }).unwrap();
            toast.success(`Order marked as ${next}`);
            setOpen(false);
        } catch (error) {
            toast.error('Could not update order', { description: (error as { data?: { message?: string } })?.data?.message || 'Please try again' });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={(value) => { if (!isLoading) setOpen(value); }}>
            <AlertDialogTrigger render={<Button size={size} className={`rounded-2xl font-bold ${action.buttonClass}`} />}>
                <Icon className="h-4 w-4 mr-1" />
                {action.label}
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className={`rounded-xl ${action.mediaClass}`}><Icon /></AlertDialogMedia>
                    <AlertDialogTitle className="font-bold">{action.title}</AlertDialogTitle>
                    <AlertDialogDescription>{action.description}</AlertDialogDescription>
                </AlertDialogHeader>

                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm space-y-1">
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">Order</span>
                        <span className="font-bold text-zinc-900 break-all text-right">#{order.refNo}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">Items</span>
                        <span className="font-medium text-zinc-900">{order.itemCount} · {formatNaira(order.total)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-zinc-500">Buyer</span>
                        <span className="font-medium text-zinc-900 text-right">{order.buyer.name}</span>
                    </div>
                    {order.deliveryAddress && (
                        <div className="flex justify-between gap-3">
                            <span className="text-zinc-500 shrink-0">Address</span>
                            <span className="font-medium text-zinc-900 text-right">{order.deliveryAddress}</span>
                        </div>
                    )}
                </div>

                {action.note && (
                    <p className="rounded-xl bg-amber-50 text-amber-800 border border-amber-100 p-3 text-xs">{action.note}</p>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Not yet</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className={action.buttonClass}>
                        {isLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        {action.confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
