'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReviewableItemsSection } from '@/components/shop/ReviewableItemsSection';
import { useGetShopOrdersQuery } from '@/store/api/shopApi';
import { formatNaira } from '@/lib/shopUtils';
import type { ShopOrderPaymentStatus } from '@/types';

const STATUS_LABEL: Record<ShopOrderPaymentStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
};

const STATUS_VARIANT: Record<ShopOrderPaymentStatus, 'secondary' | 'default' | 'destructive'> = {
    pending: 'secondary',
    paid: 'default',
    failed: 'destructive',
};

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const { data: ordersResponse, isLoading } = useGetShopOrdersQuery({ page, limit: 10 });
    const orders = ordersResponse?.data?.data || [];
    const meta = ordersResponse?.data?.meta;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

            <ReviewableItemsSection />

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!isLoading && orders.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                    You haven&apos;t placed any orders yet.
                </div>
            )}

            {!isLoading && orders.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Total</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3 font-medium">{order.refNo}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">{order.total !== undefined ? formatNaira(order.total) : '—'}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={STATUS_VARIANT[order.paymentStatus]}>
                                            {STATUS_LABEL[order.paymentStatus]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/shop/orders/${order.refNo}`} className="text-primary hover:underline">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {meta && meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <Button
                        variant="outline"
                        disabled={!meta.hasPreviousPage}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {meta.currentPage} of {meta.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={!meta.hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
