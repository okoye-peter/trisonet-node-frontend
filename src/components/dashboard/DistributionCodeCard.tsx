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
        <Card className="relative overflow-hidden border-none bg-zinc-900 rounded-3xl shadow-2xl group transition-all duration-500 hover:shadow-indigo-500/10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mt-10 -mr-10 transition-transform duration-700 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -mb-8 -ml-8" />
            
            <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md border border-white/10">
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
                            className="bg-white/5 text-white hover:bg-white/20 rounded-xl transition-all"
                            title="Show QR Code"
                        >
                            <QrCode size={16} />
                        </Button>
                    </div>
                    
                    <p className="text-xs font-medium text-zinc-400 mb-4 line-clamp-2">
                        Share this code to build your partner network and progress to Level 2.
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
