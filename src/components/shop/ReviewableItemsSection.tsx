'use client';

import Image from 'next/image';
import { ImageOff, Sparkles } from 'lucide-react';
import { ReviewModal } from './ReviewModal';
import { useGetReviewableOrderItemsQuery } from '@/store/api/shopApi';
import { getSafeImageUrl } from '@/lib/shopUtils';

export function ReviewableItemsSection() {
    const { data, isLoading } = useGetReviewableOrderItemsQuery();
    const items = data?.data ?? [];

    if (isLoading || items.length === 0) {
        return null;
    }

    return (
        <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="font-semibold">Rate your recent purchases</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1">
                {items.map((item) => {
                    const image = getSafeImageUrl(item.productImage);

                    return (
                        <div
                            key={item.orderItemId}
                            className="flex w-56 shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-3"
                        >
                            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                                {image ? (
                                    <Image src={image} alt={item.productName} fill className="object-cover" sizes="224px" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <ImageOff className="size-6" />
                                    </div>
                                )}
                            </div>
                            <span className="line-clamp-2 text-sm font-medium">{item.productName}</span>
                            <ReviewModal item={item} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
