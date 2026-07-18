const AVATAR_COLORS = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-pink-500'
];

export function AuctionAvatar({ name, className }: { name: string; className?: string }) {
    const initials = name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const bg = AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
    return (
        <div className={`flex shrink-0 items-center justify-center text-white font-bold rounded-full ${bg} ${className ?? ''}`}>
            {initials || '?'}
        </div>
    );
}
