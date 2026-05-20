'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivationActionCardProps {
    pendingReview?: boolean;
    onActivate: () => void;
}

export default function ActivationActionCard({ pendingReview = false, onActivate }: ActivationActionCardProps) {
    if (pendingReview) {
        return (
            <Card className="relative overflow-hidden bg-blue-500 border-none shadow-xl rounded-3xl">
                <CardContent className="flex items-center justify-center h-full p-6">
                    <div className="flex flex-col items-center space-y-3 text-center text-white">
                        <div className="flex items-center justify-center w-12 h-12 mb-2 rounded-full bg-white/20 animate-pulse">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Activation Request Under Review</h3>
                        <p className="text-xs font-medium text-blue-100 max-w-[200px]">
                            Please wait while we verify your payment. This usually takes a few minutes.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden border-none shadow-xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl group">
            {/* Animated glowing background */}
            <div className="absolute inset-0 opacity-50">
                <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-white/20 blur-3xl transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000" />
            </div>

            <CardContent className="relative z-10 flex flex-col items-center justify-between h-full gap-6 p-6 md:p-8 md:flex-row">
                <div className="flex items-center w-full gap-4">
                    <div className="flex items-center justify-center text-white border shadow-inner w-14 h-14 shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border-white/20">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Account Limited</p>
                        <h3 className="text-2xl font-black tracking-tight text-white">Activate Account</h3>
                        <p className="max-w-sm mt-1 text-sm font-medium text-blue-100">
                            Purchase a PIM to unlock full features and start earning from your partnerships.
                        </p>
                    </div>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full md:w-auto shrink-0">
                    <Button 
                        onClick={onActivate}
                        className="w-full md:w-auto h-14 px-8 rounded-2xl bg-white text-indigo-600 hover:bg-blue-50 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all font-black uppercase tracking-widest text-xs flex items-center gap-3"
                    >
                        Buy PIM <ArrowRight size={16} />
                    </Button>
                </motion.div>
            </CardContent>
        </Card>
    );
}
