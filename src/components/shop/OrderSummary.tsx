import { Ban } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatNaira } from '@/lib/shopUtils';

interface OrderSummaryProps {
    subtotal: number;
    deliveryFee: number;
    hasNonReturnableItems?: boolean;
    children?: React.ReactNode;
}

export function OrderSummary({ subtotal, deliveryFee, hasNonReturnableItems, children }: OrderSummaryProps) {
    const total = subtotal + deliveryFee;

    return (
        <div className="rounded-xl border border-border p-4">
            <h2 className="mb-3 font-semibold">Order Summary</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Delivery fee</span>
                    <span>{formatNaira(deliveryFee)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>{formatNaira(total)}</span>
                </div>
            </div>
            {hasNonReturnableItems && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    <Ban className="mt-0.5 size-3.5 shrink-0" />
                    <p>One or more items in this order cannot be returned once delivered.</p>
                </div>
            )}
            {children}
        </div>
    );
}
