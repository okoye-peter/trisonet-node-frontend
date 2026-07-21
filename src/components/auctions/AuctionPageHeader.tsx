import type { ReactNode } from 'react';

interface StatItem {
    label: string;
    value: ReactNode;
}

interface AuctionPageHeaderProps {
    eyebrow?: string;
    title: ReactNode;
    description?: string;
    action?: ReactNode;
    stats?: StatItem[];
}

/** Shared slim, light page header for the auction feature — replaces the old per-page dark gradient hero. */
export function AuctionPageHeader({ eyebrow, title, description, action, stats }: AuctionPageHeaderProps) {
    return (
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
                {eyebrow && <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">{eyebrow}</div>}
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
                {description && <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">{description}</p>}
                {stats && stats.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-6">
                        {stats.map((s) => (
                            <div key={s.label}>
                                <div className="text-lg font-bold text-foreground">{s.value}</div>
                                <div className="text-xs text-muted-foreground">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {action && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{action}</div>}
        </div>
    );
}
