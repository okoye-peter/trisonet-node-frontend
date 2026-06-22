'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Share2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface DistributionCodeCardProps {
    username: string;
    onShowQR: () => void;
}

export default function DistributionCodeCard({ username, onShowQR }: DistributionCodeCardProps) {
    const referralUrl = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${username}` : '';

    const handleCopy = () => {
        if (!referralUrl) return;
        navigator.clipboard.writeText(referralUrl);
        toast.success('Distribution code copied to clipboard!');
    };

    return (
        <Card className="relative overflow-hidden transition-all duration-500 border-none shadow-2xl bg-zinc-900 rounded-3xl group hover:shadow-indigo-500/10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 transition-transform duration-700 rounded-full bg-indigo-500/20 blur-3xl group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 w-24 h-24 -mb-8 -ml-8 rounded-full bg-purple-500/20 blur-2xl" />
            
            <CardContent className="relative z-10 flex flex-col justify-between h-full p-6">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 text-white border rounded-xl bg-white/10 backdrop-blur-md border-white/10">
                                <Share2 size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Distribution Code</p>
                                <h3 className="text-sm font-bold text-white">Share & Earn</h3>
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
                        Share this code to build your partner network and progress to Level 1.
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-between p-3.5 transition-colors border rounded-2xl bg-black/40 border-white/10 group-hover:border-indigo-500/30 backdrop-blur-sm">
                    <span className="text-lg font-black tracking-tight text-white ml-2 truncate max-w-[120px]">
                        {username}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-9 px-4 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-black shadow-xs hover:bg-indigo-50 transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        <Copy size={14} /> Copy
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
