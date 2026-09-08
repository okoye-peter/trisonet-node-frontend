'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryPills } from '@/components/shop/CategoryPills';
import { CategoryFilterSheet } from '@/components/shop/CategoryFilterSheet';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { useGetShopCategoriesQuery, useGetShopProductsQuery } from '@/store/api/shopApi';
import { useDebounce } from '@/hooks/use-debounce';
import { useMounted } from '@/hooks/useMounted';

function ShopHomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategoryId = searchParams.get('category');

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 350);

    const setActiveCategoryId = (id: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set('category', id);
        } else {
            params.delete('category');
        }
        const query = params.toString();
        router.replace(`/shop${query ? `?${query}` : ''}#products`, { scroll: false });
    };

    // ShopHeader also queries categories (for its dropdown) and can populate the
    // RTK Query cache before this Suspense-wrapped tree hydrates, so an unguarded
    // read here can render more category pills on the client than the server sent —
    // a hydration mismatch. Gate on `mounted` so the first client render always
    // matches the server's (categories start empty either way).
    const mounted = useMounted();
    const { data: categoriesResponse } = useGetShopCategoriesQuery();
    const { data: productsResponse, isLoading } = useGetShopProductsQuery({
        categoryId: activeCategoryId ?? undefined,
        search: debouncedSearch || undefined,
        limit: 20,
    });

    const categories = mounted ? categoriesResponse?.data ?? [] : [];
    const products = productsResponse?.data?.data ?? [];
    const totalProducts = productsResponse?.data?.meta.totalItems ?? 0;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <section className="mb-10 flex flex-col items-start gap-4 rounded-2xl bg-primary/5 p-8">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Every product approved before it&apos;s listed
                </span>
                <h1 className="text-3xl font-bold sm:text-4xl">Shop the Trisonet marketplace</h1>
                <p className="max-w-lg text-muted-foreground">
                    Browse products from trusted sellers across the Trisonet community.
                </p>
                <Button size="lg" render={<Link href="#products" />}>
                    Shop Now
                </Button>
            </section>

            <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="hidden min-w-0 flex-1 md:block">
                    <CategoryPills
                        categories={categories}
                        activeCategoryId={activeCategoryId}
                        onSelect={setActiveCategoryId}
                    />
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto md:ml-auto">
                    <CategoryFilterSheet
                        categories={categories}
                        activeCategoryId={activeCategoryId}
                        onApply={setActiveCategoryId}
                    />
                    <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="h-10 rounded-full pl-9 pr-9"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section id="products">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {debouncedSearch ? `Results for "${debouncedSearch}"` : 'Featured Products'}
                    </h2>
                    <span className="text-sm text-muted-foreground">{totalProducts} products</span>
                </div>
                {!isLoading && products.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                        No products found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
                    </div>
                ) : (
                    <ProductGrid products={products} isLoading={isLoading} />
                )}
            </section>
        </div>
    );
}

export default function ShopHomePage() {
    return (
        <Suspense fallback={null}>
            <ShopHomeContent />
        </Suspense>
    );
}
