'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewableItemsSection } from '@/components/shop/ReviewableItemsSection';
import { useGetShopOrdersQuery } from '@/store/api/shopApi';
import { useDebounce } from '@/hooks/use-debounce';
import { formatNaira } from '@/lib/shopUtils';
import type { ShopOrderPaymentStatus, ShopOrderShippingStatus } from '@/types';

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

type ShippingStatusFilter = 'all' | NonNullable<ShopOrderShippingStatus>;

const SHIPPING_STATUS_LABEL: Record<NonNullable<ShopOrderShippingStatus>, string> = {
    pending: 'Yet to be Shipped',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const SHIPPING_STATUS_VARIANT: Record<NonNullable<ShopOrderShippingStatus>, 'secondary' | 'default' | 'destructive'> = {
    pending: 'secondary',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
};

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<ShippingStatusFilter>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const debouncedSearch = useDebounce(search, 350);
    const hasActiveFilters = Boolean(search || status !== 'all' || dateFrom || dateTo);

    const { data: ordersResponse, isLoading } = useGetShopOrdersQuery({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: status === 'all' ? undefined : status,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
    });
    const orders = ordersResponse?.data?.data || [];
    const meta = ordersResponse?.data?.meta;

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Orders</h1>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full sm:w-56">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by order reference..."
                        className="h-10 rounded-full pl-9 pr-9"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setPage(1);
                            }}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value as ShippingStatusFilter);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="h-10 w-full rounded-full sm:w-48">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Yet to be Shipped</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setPage(1);
                        }}
                        max={dateTo || undefined}
                        className="h-10 w-full rounded-full sm:w-40"
                        aria-label="From date"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setPage(1);
                        }}
                        min={dateFrom || undefined}
                        className="h-10 w-full rounded-full sm:w-40"
                        aria-label="To date"
                    />
                </div>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Clear filters
                    </Button>
                )}
            </div>

            <ReviewableItemsSection />

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!isLoading && orders.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                    {hasActiveFilters ? 'No orders match your filters.' : "You haven't placed any orders yet."}
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
                                <th className="px-4 py-3 font-medium">Payment</th>
                                <th className="px-4 py-3 font-medium">Order Status</th>
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
                                    <td className="px-4 py-3">
                                        {order.shippingStatus ? (
                                            <Badge variant={SHIPPING_STATUS_VARIANT[order.shippingStatus]}>
                                                {SHIPPING_STATUS_LABEL[order.shippingStatus]}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
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
