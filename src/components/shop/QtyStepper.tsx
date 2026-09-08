'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QtyStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

export function QtyStepper({ value, onChange, min = 1, max }: QtyStepperProps) {
    return (
        <div className="inline-flex items-center rounded-lg border border-input">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={value <= min}
                onClick={() => onChange(Math.max(min, value - 1))}
                aria-label="Decrease quantity"
            >
                <Minus className="size-3.5" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{value}</span>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={max !== undefined && value >= max}
                onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
                aria-label="Increase quantity"
            >
                <Plus className="size-3.5" />
            </Button>
        </div>
    );
}
