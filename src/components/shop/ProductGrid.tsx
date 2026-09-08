import type { ShopProduct } from '@/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
    products: ShopProduct[];
    isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                No products found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
