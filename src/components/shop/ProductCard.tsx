'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Ban, ImageOff, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ShopProduct } from '@/types';
import { formatNaira, getSafeImageUrl } from '@/lib/shopUtils';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/features/shopCartSlice';
import { Button } from '@/components/ui/button';

export function ProductCard({ product }: { product: ShopProduct }) {
    const dispatch = useAppDispatch();
    const image = getSafeImageUrl(product.image);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            isReturnable: product.isReturnable,
        }));
        toast.success(`${product.name} added to cart`);
    };

    return (
        <Link
            href={`/shop/products/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(min-width: 768px) 25vw, 50vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-8" />
                    </div>
                )}
                {product.category && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-foreground">
                        {product.category.displayName}
                    </span>
                )}
                {!product.isReturnable && (
                    <span
                        title="This product cannot be returned once delivered"
                        className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-50/95 px-2 py-0.5 text-xs font-medium text-red-700"
                    >
                        <Ban className="size-3" />
                        No Returns
                    </span>
                )}
            </div>
            <div className="flex flex-1 items-end justify-between gap-2 p-3">
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    <span className="line-clamp-1 text-sm font-medium">{product.name}</span>
                    <span className="text-sm font-bold text-primary">{formatNaira(product.price)}</span>
                </div>
                <Button
                    type="button"
                    size="icon"
                    className="shrink-0 rounded-full"
                    disabled={product.quantity <= 0}
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.name} to cart`}
                >
                    <Plus className="size-4" />
                </Button>
            </div>
        </Link>
    );
}
