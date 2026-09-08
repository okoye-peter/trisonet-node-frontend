'use client';

import { cn } from '@/lib/utils';
import type { ShopCategory } from '@/types';

interface CategoryPillsProps {
    categories: ShopCategory[];
    activeCategoryId: string | null;
    onSelect: (categoryId: string | null) => void;
}

export function CategoryPills({ categories, activeCategoryId, onSelect }: CategoryPillsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            <button
                type="button"
                onClick={() => onSelect(null)}
                className={cn(
                    'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    activeCategoryId === null ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
            >
                All
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelect(category.id)}
                    className={cn(
                        'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                        activeCategoryId === category.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                >
                    {category.displayName}
                </button>
            ))}
        </div>
    );
}
