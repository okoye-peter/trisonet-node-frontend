'use client';

import { useState } from 'react';
import { ListFilter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { ShopCategory } from '@/types';

interface CategoryFilterSheetProps {
    categories: ShopCategory[];
    activeCategoryId: string | null;
    onApply: (categoryId: string | null) => void;
}

export function CategoryFilterSheet({ categories, activeCategoryId, onApply }: CategoryFilterSheetProps) {
    const [open, setOpen] = useState(false);
    const [pendingId, setPendingId] = useState<string | null>(activeCategoryId);

    const activeLabel = activeCategoryId
        ? categories.find((c) => c.id === activeCategoryId)?.displayName
        : null;

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                if (next) setPendingId(activeCategoryId);
                setOpen(next);
            }}
        >
            <SheetTrigger render={
                <Button variant="outline" className="h-10 shrink-0 gap-1.5 rounded-full md:hidden">
                    <ListFilter className="size-4" />
                    {activeLabel ?? 'Categories'}
                </Button>
            } />
            <SheetContent side="bottom" className="max-h-[75vh] rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle>Filter by category</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 pb-2">
                    <Row label="All Products" active={pendingId === null} onClick={() => setPendingId(null)} />
                    {categories.map((category) => (
                        <Row
                            key={category.id}
                            label={category.displayName}
                            active={pendingId === category.id}
                            onClick={() => setPendingId(category.id)}
                        />
                    ))}
                </div>

                <SheetFooter>
                    <Button
                        size="lg"
                        onClick={() => {
                            onApply(pendingId);
                            setOpen(false);
                        }}
                    >
                        Apply
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function Row({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors',
                active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/60'
            )}
        >
            {label}
            {active && <Check className="size-4" />}
        </button>
    );
}
