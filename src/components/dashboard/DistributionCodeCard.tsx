'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Share2, ExternalLink, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

type CardAccent = 'indigo' | 'rose' | 'emerald';

const ACCENT_STYLES: Record<CardAccent, {
    glowTop: string;
    glowBottom: string;
    iconBg: string;
    iconBorder: string;
    hoverShadow: string;
    hoverBorder: string;
    copyHover: string;
}> = {
    indigo: {
        glowTop: 'bg-indigo-500/20',
        glowBottom: 'bg-purple-500/20',
        iconBg: 'bg-indigo-500/15',
        iconBorder: 'border-indigo-400/30',
        hoverShadow: 'hover:shadow-indigo-500/10',
        hoverBorder: 'group-hover:border-indigo-500/30',
        copyHover: 'hover:bg-indigo-50',
    },
    rose: {
        glowTop: 'bg-rose-500/20',
        glowBottom: 'bg-orange-500/20',
        iconBg: 'bg-rose-500/15',
        iconBorder: 'border-rose-400/30',
        hoverShadow: 'hover:shadow-rose-500/10',
        hoverBorder: 'group-hover:border-rose-500/30',
        copyHover: 'hover:bg-rose-50',
    },
    emerald: {
        glowTop: 'bg-emerald-500/20',
        glowBottom: 'bg-teal-500/20',
        iconBg: 'bg-emerald-500/15',
        iconBorder: 'border-emerald-400/30',
        hoverShadow: 'hover:shadow-emerald-500/10',
        hoverBorder: 'group-hover:border-emerald-500/30',
        copyHover: 'hover:bg-emerald-50',
    },
};

interface DistributionCodeCardProps {
    username: string;
    onShowQR: () => void;
    icon?: LucideIcon;
    eyebrow?: string;
    title?: string;
    description?: string;
    referralUrl?: string;
    accent?: CardAccent;
}

export default function DistributionCodeCard({
    username,
    onShowQR,
    icon: Icon = Share2,
    eyebrow = 'Distribution Code',
    title = 'Share & Earn',
    description = 'Share this code to build your partner network and progress to Level 1.',
    referralUrl: referralUrlOverride,
    accent = 'indigo',
}: DistributionCodeCardProps) {
    const styles = ACCENT_STYLES[accent];
    const referralUrl = referralUrlOverride
        ?? (typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${username}` : '');

    const handleCopy = () => {
        if (!referralUrl) return;
        navigator.clipboard.writeText(referralUrl);
        toast.success('Link copied to clipboard!');
    };

    return (
        <Card className={`relative overflow-hidden transition-all duration-500 border-none shadow-2xl bg-zinc-900 rounded-3xl group ${styles.hoverShadow}`}>
            {/* Background elements */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 transition-transform duration-700 rounded-full ${styles.glowTop} blur-3xl group-hover:scale-150`} />
            <div className={`absolute bottom-0 left-0 w-24 h-24 -mb-8 -ml-8 rounded-full ${styles.glowBottom} blur-2xl`} />

            <CardContent className="relative z-10 flex flex-col justify-between h-full p-6">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 text-white border rounded-xl backdrop-blur-md ${styles.iconBg} ${styles.iconBorder}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{eyebrow}</p>
                                <h3 className="text-sm font-bold text-white">{title}</h3>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onShowQR}
                            className="text-white transition-all bg-white/5 hover:bg-white/20 rounded-xl"
                            title="Show QR Code"
                        >
                            <QrCode size={16} />
                        </Button>
                    </div>

                    <p className="mb-4 text-xs font-medium text-zinc-400 line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className={`mt-4 flex items-center justify-between p-3.5 transition-colors border rounded-2xl bg-black/40 border-white/10 ${styles.hoverBorder} backdrop-blur-sm`}>
                    <span className="text-lg font-black tracking-tight text-white ml-2 truncate max-w-[120px]">
                        {username}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className={`h-9 px-4 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-black shadow-xs ${styles.copyHover} transition-all transform active:scale-95 flex items-center gap-2`}
                    >
                        <Copy size={14} /> Copy
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
