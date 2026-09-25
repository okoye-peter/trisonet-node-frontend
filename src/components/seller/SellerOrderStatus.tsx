'use client';

import { useState } from 'react';
import { Loader2, Pencil, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
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

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,18}[0-9]$/;

/**
 * Marks a pending order shipped, or corrects the courier on a shipped one. Sellers must
 * name the courier so Trisonet can call them and confirm delivery - only an admin marks
 * an order delivered. Renders nothing once the order is delivered or cancelled.
 */
export function SellerOrderAction({ order, size = 'default' }: { order: SellerOrder; size?: 'default' | 'sm' }) {
    const [open, setOpen] = useState(false);
    const [courierName, setCourierName] = useState('');
    const [courierPhone, setCourierPhone] = useState('');
    const [updateStatus, { isLoading }] = useUpdateSellerOrderStatusMutation();

    const isEdit = order.status === 'shipped';
    if (order.status !== 'pending' && !isEdit) return null;

    const nameError = courierName.trim().length < 2 ? 'Enter the courier\'s name' : null;
    const phoneError = !PHONE_PATTERN.test(courierPhone.trim()) ? 'Enter a valid phone number' : null;

    const handleOpenChange = (value: boolean) => {
        if (isLoading) return;
        if (value) {
            setCourierName(order.courier?.name ?? '');
            setCourierPhone(order.courier?.phone ?? '');
        }
        setOpen(value);
    };

    const handleConfirm = async () => {
        if (nameError || phoneError) return;
        try {
            await updateStatus({ refNo: order.refNo, courierName: courierName.trim(), courierPhone: courierPhone.trim() }).unwrap();
            toast.success(isEdit ? 'Courier details updated' : 'Order marked as shipped');
            setOpen(false);
        } catch (error) {
            toast.error('Could not update order', { description: (error as { data?: { message?: string } })?.data?.message || 'Please try again' });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            {isEdit ? (
                <AlertDialogTrigger render={<Button size={size} variant="outline" className="rounded-2xl font-bold" />}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit courier
                </AlertDialogTrigger>
            ) : (
                <AlertDialogTrigger render={<Button size={size} className="rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white" />}>
                    <Truck className="h-4 w-4 mr-1" />
                    Mark as shipped
                </AlertDialogTrigger>
            )}
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className="rounded-xl bg-blue-50 text-blue-600"><Truck /></AlertDialogMedia>
                    <AlertDialogTitle className="font-bold">{isEdit ? 'Update courier details' : 'Mark this order as shipped?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {isEdit
                            ? 'Correct the details of the courier delivering this order.'
                            : 'Only confirm once the items have left your hands. The buyer will be told their order is on its way.'}
                    </AlertDialogDescription>
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

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor={`courier-name-${order.id}`}>Courier / delivery person&apos;s name</Label>
                        <Input
                            id={`courier-name-${order.id}`}
                            value={courierName}
                            maxLength={100}
                            onChange={(e) => setCourierName(e.target.value)}
                            placeholder="e.g. Musa Ibrahim (GIG Logistics)"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`courier-phone-${order.id}`}>Courier&apos;s phone number</Label>
                        <Input
                            id={`courier-phone-${order.id}`}
                            type="tel"
                            inputMode="tel"
                            value={courierPhone}
                            maxLength={20}
                            onChange={(e) => setCourierPhone(e.target.value)}
                            placeholder="e.g. 08012345678"
                            aria-invalid={courierPhone !== '' && !!phoneError}
                        />
                        {courierPhone !== '' && phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
                    </div>
                </div>

                <p className="rounded-xl bg-amber-50 text-amber-800 border border-amber-100 p-3 text-xs">
                    Trisonet will call this courier to confirm delivery before marking the order delivered.
                </p>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{isEdit ? 'Cancel' : 'Not yet'}</AlertDialogCancel>
                    <Button onClick={handleConfirm} disabled={isLoading || !!nameError || !!phoneError} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        {isEdit ? 'Save courier details' : 'Yes, it has shipped'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
