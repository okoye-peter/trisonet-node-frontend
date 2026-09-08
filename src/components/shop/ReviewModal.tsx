'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Star as StarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { StarRating } from './StarRating';
import { useCreateReviewMutation } from '@/store/api/shopApi';
import { getSafeImageUrl } from '@/lib/shopUtils';
import type { ShopReviewableOrderItem } from '@/types';

export function ReviewModal({ item }: { item: ShopReviewableOrderItem }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [createReview, { isLoading }] = useCreateReviewMutation();
    const image = getSafeImageUrl(item.productImage);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a star rating');
            return;
        }

        try {
            await createReview({ orderItemId: item.orderItemId, rating, comment: comment.trim() || undefined }).unwrap();
            toast.success('Thanks for your review!');
            setOpen(false);
            setRating(0);
            setComment('');
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to submit review. Please try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                <Button size="sm" variant="outline" className="gap-1.5">
                    <StarIcon className="size-3.5" />
                    Write a Review
                </Button>
            } />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Review your purchase</DialogTitle>
                    <DialogDescription>Share your experience to help other shoppers.</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {image && (
                            <Image src={image} alt={item.productName} fill className="object-cover" sizes="48px" />
                        )}
                    </div>
                    <span className="line-clamp-2 text-sm font-medium">{item.productName}</span>
                </div>

                <div className="flex flex-col items-center gap-2 py-2">
                    <StarRating value={rating} onChange={setRating} size={32} />
                    <span className="text-xs text-muted-foreground">
                        {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Tap a star to rate'}
                    </span>
                </div>

                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike? (optional)"
                    rows={3}
                    maxLength={1000}
                />

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
