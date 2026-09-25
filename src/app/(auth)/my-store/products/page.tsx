'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNaira } from '@/lib/shopUtils';
import { useDebounce } from '@/hooks/use-debounce';
import {
    useGetMySellerStoreQuery,
    useGetMySellerProductsQuery,
    useDeleteSellerProductMutation,
} from '@/store/api/sellerApi';
import type { SellerProduct, SellerProductStatus } from '@/types';

const FILTERS: { label: string; value?: SellerProductStatus }[] = [
    { label: 'All' },
    { label: 'Live', value: 'approved' },
    { label: 'In review', value: 'pending' },
    { label: 'Needs changes', value: 'rejected' },
];

const STATUS_BADGE: Record<SellerProductStatus, { label: string; className: string }> = {
    approved: { label: 'Live', className: 'bg-emerald-50 text-emerald-700' },
    pending: { label: 'In review', className: 'bg-amber-50 text-amber-700' },
    rejected: { label: 'Needs changes', className: 'bg-red-50 text-red-700' },
};

function ProductRow({ product }: { product: SellerProduct }) {
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteSellerProductMutation();
    const badge = STATUS_BADGE[product.status];

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
        try {
            await deleteProduct(product.id).unwrap();
            toast.success('Product deleted');
        } catch (error) {
            toast.error('Could not delete product', { description: (error as { data?: { message?: string } })?.data?.message || 'Please try again' });
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 border-b border-zinc-100 last:border-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0]?.url} alt="" className="h-16 w-16 rounded-xl object-cover bg-zinc-100 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900 truncate">{product.name}</p>
                <p className="text-sm text-zinc-500">
                    {formatNaira(product.price)} · {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </p>
                {product.status === 'rejected' && product.reviewComment && (
                    <p className="text-xs text-red-600 mt-1">Reviewer: {product.reviewComment}</p>
                )}
            </div>
            <span className={`hidden sm:inline-flex rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
            <div className="flex gap-1">
                <Link href={`/my-store/products/${product.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Edit product"><Pencil className="h-4 w-4" /></Button>
                </Link>
                <Button variant="ghost" size="icon" aria-label="Delete product" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}

export default function MyStoreProductsPage() {
    const [status, setStatus] = useState<SellerProductStatus | undefined>();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search.trim(), 350);
    const { data: storeResponse } = useGetMySellerStoreQuery();
    const { data, isLoading, isFetching } = useGetMySellerProductsQuery({ page, limit: 20, status, search: debouncedSearch || undefined });

    const canListProducts = storeResponse?.data?.store?.canListProducts ?? false;
    const products = data?.data?.data ?? [];
    const meta = data?.data?.meta;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/my-store" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
                <ArrowLeft className="h-4 w-4" /> My Store
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2"><Package className="h-6 w-6" /> Products</h1>
                {canListProducts && (
                    <Link href="/my-store/products/new">
                        <Button className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"><Plus className="h-4 w-4 mr-1" /> Add product</Button>
                    </Link>
                )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name or ID..."
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
                    {FILTERS.map((f) => (
                        <button
                            key={f.label}
                            type="button"
                            onClick={() => { setStatus(f.value); setPage(1); }}
                            className={`rounded-full px-4 py-1.5 text-sm font-bold ${status === f.value ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="rounded-[2rem] border-zinc-100">
                <CardContent className="p-2">
                    {isLoading ? (
                        <div className="space-y-2 p-4">
                            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : products.length === 0 ? (
                        <p className="p-10 text-center text-sm text-zinc-500">
                            {debouncedSearch ? `No products match "${debouncedSearch}".` : status ? 'No products here.' : canListProducts ? 'You have not added any products yet.' : 'Your store must be approved before you can add products.'}
                        </p>
                    ) : (
                        <div className={isFetching ? 'opacity-60' : ''}>
                            {products.map((p) => <ProductRow key={p.id} product={p} />)}
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
