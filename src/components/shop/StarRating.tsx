'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: number;
    className?: string;
}

export function StarRating({ value, onChange, size = 16, className }: StarRatingProps) {
    const [hovered, setHovered] = useState<number | null>(null);
    const interactive = Boolean(onChange);
    const displayValue = hovered ?? value;

    return (
        <div className={cn('flex items-center gap-0.5', className)} onMouseLeave={() => setHovered(null)}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.round(displayValue);
                const icon = (
                    <Star
                        width={size}
                        height={size}
                        className={filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40'}
                    />
                );

                if (!interactive) {
                    return <span key={star}>{icon}</span>;
                }

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => setHovered(star)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        className="transition-transform hover:scale-110"
                    >
                        {icon}
                    </button>
                );
            })}
        </div>
    );
}
