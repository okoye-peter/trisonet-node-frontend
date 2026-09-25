'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, ChevronRight, Search, ShoppingBag, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNaira } from '@/lib/shopUtils';
import { useDebounce } from '@/hooks/use-debounce';
import { useGetMySellerOrdersQuery } from '@/store/api/sellerApi';
import { SellerOrderAction, SellerOrderDeadline, SellerOrderStatusBadge } from '@/components/seller/SellerOrderStatus';
import type { SellerOrder, SellerOrderStatus } from '@/types';

const FILTERS: { label: string; value?: SellerOrderStatus }[] = [
    { label: 'All' },
    { label: 'To ship', value: 'pending' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
];

function OrderRow({ order }: { order: SellerOrder }) {
    const [first] = order.items;
    const more = order.items.length - 1;

    return (
        <div className="flex flex-col gap-3 p-4 border-b border-zinc-100 last:border-0 sm:flex-row sm:items-center sm:gap-4">
            <Link href={`/my-store/orders/${encodeURIComponent(order.refNo)}`} className="flex flex-1 min-w-0 items-center gap-4 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={first?.image} alt="" className="h-16 w-16 rounded-xl object-cover bg-zinc-100 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-zinc-900 truncate group-hover:underline">#{order.refNo}</p>
                        <SellerOrderStatusBadge status={order.status} />
                        <SellerOrderDeadline order={order} />
                    </div>
                    <p className="text-sm text-zinc-600 truncate">
                        {first?.name}{first && first.quantity > 1 ? ` × ${first.quantity}` : ''}{more > 0 ? ` + ${more} more` : ''}
                    </p>
                    <p className="text-xs text-zinc-400">
                        {format(new Date(order.createdAt), 'd MMM yyyy, h:mma')} · {order.buyer.name}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold text-zinc-900">{formatNaira(order.total)}</p>
                    {order.payout && <p className="text-xs text-zinc-500">You get {formatNaira(order.payout.net)}</p>}
                </div>
                <ChevronRight className="hidden sm:block h-4 w-4 text-zinc-300 shrink-0" />
            </Link>
            {order.nextStatus && (
                <div className="sm:shrink-0">
                    <SellerOrderAction order={order} size="sm" />
                </div>
            )}
        </div>
    );
}

export default function MyStoreOrdersPage() {
    const [status, setStatus] = useState<SellerOrderStatus | undefined>();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search.trim(), 350);
    const { data, isLoading, isFetching } = useGetMySellerOrdersQuery({ page, limit: 20, status, search: debouncedSearch || undefined });

    const orders = data?.data?.data ?? [];
    const meta = data?.data?.meta;
    const counts = data?.data?.statusCounts;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/my-store" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
                <ArrowLeft className="h-4 w-4" /> My Store
            </Link>
            <div>
                <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2"><ShoppingBag className="h-6 w-6" /> Orders</h1>
                <p className="text-sm text-zinc-500 mt-1">Paid orders for your products. Each one must be delivered within 14 days of payment - ship it, then mark it delivered once the buyer has it.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by order reference..."
                        className="h-10 rounded-full pl-9 pr-9"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => { setSearch(''); setPage(1); }}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => {
                        const count = f.value && counts ? counts[f.value] : undefined;
                        return (
                            <button
                                key={f.label}
                                type="button"
                                onClick={() => { setStatus(f.value); setPage(1); }}
                                className={`rounded-full px-4 py-1.5 text-sm font-bold ${status === f.value ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                            >
                                {f.label}{count ? ` (${count})` : ''}
                            </button>
                        );
                    })}
                </div>
            </div>

            <Card className="rounded-[2rem] border-zinc-100">
                <CardContent className="p-2">
                    {isLoading ? (
                        <div className="space-y-2 p-4">
                            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="p-10 text-center text-sm text-zinc-500">
                            {debouncedSearch ? `No orders match "${debouncedSearch}".` : status ? 'No orders here.' : 'You have no orders yet. They will show up here once a buyer pays for one of your products.'}
                        </p>
                    ) : (
                        <div className={isFetching ? 'opacity-60' : ''}>
                            {orders.map((o) => <OrderRow key={o.id} order={o} />)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 text-sm">
                    <Button variant="outline" size="sm" disabled={!meta.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <span>Page {meta.currentPage} of {meta.totalPages}</span>
                    <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
            )}
        </div>
    );
}
