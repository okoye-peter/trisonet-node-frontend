'use client';

import { motion, type Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Trophy, Crown, Gift, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserAwards, Prize } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import Link from 'next/link';
import NextImage from 'next/image';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

export default function WinningsStatusPage() {
    const { data: awardsResponse, isLoading, isError, refetch } = useQuery<{ data: UserAwards }>({
        queryKey: ['userAwards'],
        queryFn: async () => {
            const res = await api.get('/users/awards');
            return res.data;
        }
    });

    const awards = awardsResponse?.data;

    if (isLoading) return <LoadingScreen />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="p-4 rounded-full bg-red-50 text-red-500">
                    <Trophy size={48} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Failed to load winnings</h2>
                <p className="text-zinc-500">There was an error fetching your status. Please try again.</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-2">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-6xl mx-auto space-y-12 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                    <Sparkles size={14} className="animate-pulse" />
                    Winnings & Recognition
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900">
                    Your <span className="text-indigo-600">Rewards</span> Journey
                </h1>
                <p className="text-zinc-500 font-medium max-w-2xl mx-auto">
                    Track your ranking and celebrate the milestones you&apos;ve achieved within the community.
                </p>
            </motion.div>

            {/* Rank Spotlight Card */}
            <motion.div variants={itemVariants}>
                <Card className="relative overflow-hidden border-none bg-zinc-900 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 -m-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -m-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                    
                    <CardContent className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Current Regional Rank</h2>
                            <div className="flex items-center gap-4 justify-center md:justify-start">
                                <span className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
                                    #{awards?.rank || '-'}
                                </span>
                                <div className="p-4 rounded-3xl bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30">
                                    <Crown size={48} className="text-indigo-400" />
                                </div>
                            </div>
                            <p className="text-zinc-400 font-medium max-w-sm">
                                You are currently ranked <span className="text-indigo-400 font-bold">#{awards?.rank}</span> in your region. Keep growing your network to climb higher!
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Prizes</p>
                                <p className="text-3xl font-black">{awards?.prizes.length || 0}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Region</p>
                                <p className="text-xl font-black truncate max-w-[100px]">{awards?.user.country || 'Ours'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Prizes Grid */}
            <div className="space-y-8">
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Achievement Gallery</h2>
                        <p className="text-sm font-medium text-zinc-500">Your collection of earned rewards</p>
                    </div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {awards?.prizes && awards.prizes.length > 0 ? (
                        awards.prizes.map((prize: Prize) => (
                            <motion.div key={prize.id} variants={itemVariants}>
                                <Card className="group h-full overflow-hidden border-zinc-100 hover:border-indigo-100 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5">
                                    <div className="relative h-48 overflow-hidden bg-zinc-50">
                                        {prize.url ? (
                                            <NextImage 
                                                src={prize.url} 
                                                alt={prize.name} 
                                                width={400}
                                                height={300}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-zinc-200">
                                                <Gift size={64} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                                                Position {prize.position}
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                {prize.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <MapPin size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {prize.location || 'Distributed Regionally'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 pt-2 text-zinc-500">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold">
                                                        {i}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                And others won this
                                            </span>
                                        </div>

                                        <Button className="w-full mt-4 rounded-xl bg-zinc-50 hover:bg-zinc-900 hover:text-white text-zinc-900 border-none transition-all group-hover:shadow-lg">
                                            View Details
                                            <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                            <div className="inline-flex p-4 rounded-full bg-zinc-100 text-zinc-400">
                                <Gift size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">No prizes yet</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto text-sm mt-1">
                                    Your achievements will appear here as you climb the ranks and win rewards.
                                </p>
                            </div>
                            <Link href="/dashboard" passHref>
                                <Button variant="outline" className="rounded-xl border-zinc-200">
                                    Return to Dashboard
                                </Button>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
