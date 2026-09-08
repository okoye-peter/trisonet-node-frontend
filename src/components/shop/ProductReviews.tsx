'use client';

import { MessageSquare } from 'lucide-react';
import { StarRating } from './StarRating';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProductReviewsQuery } from '@/store/api/shopApi';

export function ProductReviews({ productId }: { productId: string }) {
    const { data, isLoading } = useGetProductReviewsQuery({ productId, limit: 20 });
    const reviews = data?.data?.data ?? [];
    const summary = data?.data?.summary ?? { average: 0, count: 0 };

    return (
        <div className="border-t border-border pt-6">
            <div className="mb-4 flex items-center gap-3">
                <h2 className="font-semibold">Reviews</h2>
                {summary.count > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <StarRating value={summary.average} size={14} />
                        <span className="font-medium text-foreground">{summary.average}</span>
                        <span>&middot; {summary.count} review{summary.count === 1 ? '' : 's'}</span>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
            )}

            {!isLoading && reviews.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
                    <MessageSquare className="size-6" />
                    <p className="text-sm">No reviews yet. Be the first to review this product after it's delivered.</p>
                </div>
            )}

            {!isLoading && reviews.length > 0 && (
                <ul className="space-y-4">
                    {reviews.map((review) => (
                        <li key={review.id} className="rounded-xl border border-border p-4">
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="font-medium">{review.reviewerName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <StarRating value={review.rating} size={14} className="mb-2" />
                            {review.comment && (
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
