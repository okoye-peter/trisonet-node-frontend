'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Ban, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QtyStepper } from '@/components/shop/QtyStepper';
import { ShareLinks } from '@/components/shop/ShareLinks';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { StarRating } from '@/components/shop/StarRating';
import { ProductReviews } from '@/components/shop/ProductReviews';
import { useGetShopProductQuery } from '@/store/api/shopApi';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/features/shopCartSlice';
import { formatNaira, SHOP_RETURN_WINDOW_DAYS } from '@/lib/shopUtils';

export function ProductDetailClient({ id }: { id: string }) {
    const { data: productResponse, isLoading } = useGetShopProductQuery(id);
    const dispatch = useAppDispatch();
    const [quantity, setQuantity] = useState(1);

    const product = productResponse?.data;

    if (isLoading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
                Product not found.
            </div>
        );
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleAddToCart = () => {
        dispatch(addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            isReturnable: product.isReturnable,
            quantity,
        }));
        toast.success(`${product.name} added to cart`);
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <nav className="mb-6 text-sm text-muted-foreground">
                <Link href="/shop" className="hover:text-foreground">Home</Link>
                {product.category && (
                    <>
                        {' / '}
                        <span>{product.category.displayName}</span>
                    </>
                )}
                {' / '}
                <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-2">
                <ProductImageGallery images={product.images} fallbackImage={product.image} alt={product.name} />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {!product.isReturnable && (
                            <span className="flex w-fit items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                <Ban className="size-3" />
                                Not Returnable
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
                    {product.reviewSummary.count > 0 && (
                        <a href="#reviews" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                            <StarRating value={product.reviewSummary.average} size={14} />
                            <span className="font-medium text-foreground">{product.reviewSummary.average}</span>
                            <span>({product.reviewSummary.count})</span>
                        </a>
                    )}
                    <span className="text-2xl font-bold text-primary">{formatNaira(product.price)}</span>

                    <div className="flex items-center gap-4">
                        <QtyStepper value={quantity} onChange={setQuantity} max={product.quantity} />
                        <Button size="lg" disabled={product.quantity <= 0} onClick={handleAddToCart} className="flex-1">
                            Add to Cart
                        </Button>
                    </div>

                    <Button variant="outline" size="lg" disabled={product.quantity <= 0} render={<Link href="/shop/checkout" />} onClick={handleAddToCart}>
                        Buy Now
                    </Button>

                    <div className="rounded-xl border border-border p-4">
                        <div className="mb-2 text-sm font-medium">Share this product</div>
                        <ShareLinks url={shareUrl} text={product.name} />
                    </div>

                    <div>
                        <h2 className="mb-2 font-semibold">Description</h2>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>

                    {product.isReturnable ? (
                        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                            <RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" />
                            <p>
                                <span className="font-medium text-foreground">Returnable: </span>
                                This product can be returned within {SHOP_RETURN_WINDOW_DAYS} days of delivery.
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                            <Ban className="mt-0.5 size-4 shrink-0" />
                            <p>
                                <span className="font-medium">Not returnable: </span>
                                This product cannot be returned once it has been delivered. Please review your order carefully before purchasing.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div id="reviews" className="mt-10">
                <ProductReviews productId={product.id} />
            </div>
        </div>
    );
}
