'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetShopOrderQuery } from '@/store/api/shopApi';
import { formatNaira } from '@/lib/shopUtils';
import type { ShopOrderPaymentStatus } from '@/types';

const STATUS_LABEL: Record<ShopOrderPaymentStatus, string> = {
    pending: 'Payment Pending',
    paid: 'Paid',
    failed: 'Payment Failed',
};

const STATUS_VARIANT: Record<ShopOrderPaymentStatus, 'secondary' | 'default' | 'destructive'> = {
    pending: 'secondary',
    paid: 'default',
    failed: 'destructive',
};

export default function OrderDetailPage({ params }: { params: Promise<{ refNo: string }> }) {
    const { refNo } = use(params);
    const { data: orderResponse, isLoading } = useGetShopOrderQuery(refNo);
    const order = orderResponse?.data;

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center py-24">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
                Order not found.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <Link href="/shop/orders" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
                &larr; Back to Orders
            </Link>

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Order #{order.refNo}</h1>
                <Badge variant={STATUS_VARIANT[order.paymentStatus]}>{STATUS_LABEL[order.paymentStatus]}</Badge>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleString()}
            </p>

            {order.paymentStatus === 'pending' && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    This order is still awaiting payment.{' '}
                    <Link href={`/shop/order-success?ref=${order.refNo}`} className="font-semibold underline">
                        Complete your payment
                    </Link>
                </div>
            )}

            {order.paymentStatus === 'failed' && (
                <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    We couldn&apos;t confirm payment for this order. If you already sent the money, reach out to customer care
                    (info@trisonet.com or trisonetasset@gmail.com, or our complaints WhatsApp group) with proof of payment for help.
                </div>
            )}

            <div className="mb-6 rounded-xl border border-border p-4">
                <h2 className="mb-3 font-semibold">Items</h2>
                <div className="space-y-2 text-sm">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                            <span className="text-muted-foreground">{item.product?.name ?? 'Product'} &times; {item.quantity}</span>
                            <span>{formatNaira(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between border-t border-border pt-2 text-muted-foreground">
                        <span>Delivery fee</span>
                        <span>{formatNaira(order.deliveryFee)}</span>
                    </div>
                    {order.total !== undefined && (
                        <div className="flex justify-between border-t border-border pt-2 font-bold">
                            <span>Total</span>
                            <span>{formatNaira(order.total)}</span>
                        </div>
                    )}
                </div>
            </div>

            {order.shipping && (
                <div className="mb-6 rounded-xl border border-border p-4">
                    <h2 className="mb-3 font-semibold">Shipping Details</h2>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{order.shipping.fullName}</p>
                        <p>{order.shipping.phone}</p>
                        <p>{order.shipping.address}, {order.shipping.city}, {order.shipping.state}</p>
                    </div>
                </div>
            )}

            <Button size="lg" className="w-full" render={<Link href="/shop" />}>
                Continue Shopping
            </Button>
        </div>
    );
}
