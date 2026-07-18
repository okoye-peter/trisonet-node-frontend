'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

function getRemaining(endsAt: string) {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { total: diff, hours, minutes, seconds };
}

/** Inline "2h 14m left" style timer used on auction cards and lists. */
export function CountdownTimer({ endsAt, className }: { endsAt: string; className?: string }) {
    const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

    useEffect(() => {
        const interval = setInterval(() => setRemaining(getRemaining(endsAt)), 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    if (remaining.total <= 0) {
        return (
            <div className={cn('flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-500', className)}>
                <Clock size={12} /> Ended
            </div>
        );
    }

    const isUrgent = remaining.total < 15 * 60 * 1000;
    const label = remaining.hours > 0
        ? `${remaining.hours}h ${remaining.minutes}m left`
        : remaining.minutes > 0
            ? `${remaining.minutes}m left${isUrgent ? '!' : ''}`
            : `${remaining.seconds}s left!`;

    return (
        <div className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold',
            isUrgent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600',
            className
        )}>
            <Clock size={12} /> {label}
        </div>
    );
}

/** Large block-style countdown (Hrs/Min/Sec) used on the auction detail hero. */
export function CountdownBlocks({ endsAt }: { endsAt: string }) {
    const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

    useEffect(() => {
        const interval = setInterval(() => setRemaining(getRemaining(endsAt)), 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
        <div className="flex gap-2">
            {[
                { val: remaining.hours, lbl: 'Hrs' },
                { val: remaining.minutes, lbl: 'Min' },
                { val: remaining.seconds, lbl: 'Sec' },
            ].map((block) => (
                <div key={block.lbl} className="min-w-[60px] rounded-xl bg-indigo-950 px-4 py-3 text-center">
                    <div className="text-2xl font-black text-white">{pad(block.val)}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-indigo-300">{block.lbl}</div>
                </div>
            ))}
        </div>
    );
}
