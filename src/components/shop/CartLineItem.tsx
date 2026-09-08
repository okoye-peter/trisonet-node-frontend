'use client';

import Image from 'next/image';
import { ImageOff, Trash2 } from 'lucide-react';
import type { ShopCartItem } from '@/store/features/shopCartSlice';
import { formatNaira, getSafeImageUrl } from '@/lib/shopUtils';
import { QtyStepper } from './QtyStepper';
import { Button } from '@/components/ui/button';

interface CartLineItemProps {
    item: ShopCartItem;
    onQuantityChange: (quantity: number) => void;
    onRemove: () => void;
}

export function CartLineItem({ item, onQuantityChange, onRemove }: CartLineItemProps) {
    const image = getSafeImageUrl(item.image);

    return (
        <div className="flex items-center gap-4 rounded-xl border border-border p-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {image ? (
                    <Image src={image} alt={item.name} fill className="object-cover" sizes="80px" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-6" />
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{item.name}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-red-600"
                        onClick={onRemove}
                        aria-label="Remove item"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <QtyStepper value={item.quantity} onChange={onQuantityChange} />
                    <span className="font-semibold">{formatNaira(item.price * item.quantity)}</span>
                </div>
            </div>
        </div>
    );
}
