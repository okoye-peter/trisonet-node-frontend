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

const TARGET_REWARDS = [
    {
        position: "1st",
        name: "Grand Prize",
        description: "Luxury Black Toyota GranAce Van",
        image: "/assets/img/awards/fisrt_position.jpeg",
        color: "from-amber-400 to-amber-600",
        range: [1, 1],
        value: "Luxury Van"
    },
    {
        position: "2nd",
        name: "Runner Up",
        description: "Premium White Family SUV",
        image: "/assets/img/awards/second.jpeg",
        color: "from-slate-300 to-slate-500",
        range: [2, 12],
        value: "Premium SUV"
    },
    {
        position: "3rd",
        name: "Finalist Reward",
        description: "High-Performance HP Laptop",
        image: "/assets/img/awards/third.jpeg",
        color: "from-orange-400 to-orange-600",
        range: [13, 6000],
        value: "HP Laptop"
    },
    {
        position: "Bonus",
        name: "Bonus Prize",
        description: "Atouch X19PRO Star Tablet PC",
        image: "/assets/img/awards/trisonet_bonus_ipad.jpeg",
        color: "from-blue-400 to-blue-600",
        range: [6001, Infinity],
        value: "0.5 Gkwth"
    }
];

const getTargetRewardByRank = (rank: number | string | undefined) => {
    const rNum = Number(rank);
    if (!rank || isNaN(rNum)) return TARGET_REWARDS[3];
    return TARGET_REWARDS.find(r => rNum >= r.range[0] && rNum <= r.range[1]) || TARGET_REWARDS[3];
};

const getPrizeImage = (position: number, url?: string | null) => {
    if (url) return url;
    if (position === 1) return "/assets/img/awards/fisrt_position.jpeg";
    if (position >= 2 && position <= 12) return "/assets/img/awards/second.jpeg";
    if (position >= 13 && position <= 6000) return "/assets/img/awards/third.jpeg";
    return "/assets/img/awards/trisonet_bonus_ipad.jpeg";
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
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />
                    
                    <CardContent className="relative z-10 p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-16">
                        <div className="space-y-8 text-center md:text-left flex-1">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                    <Trophy size={12} />
                                    Regional Standings
                                </div>
                                <div className="flex items-center gap-8 justify-center md:justify-start">
                                    <div className="relative">
                                        <span className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none italic bg-linear-to-br from-white via-white to-zinc-600 bg-clip-text text-transparent">
                                            #{awards?.rank || '-'}
                                        </span>
                                        {/* Ribbon Badge */}
                                        <div className="absolute -top-4 -right-8 animate-bounce">
                                            <div className="relative h-16 w-16 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-indigo-600 rounded-full rotate-45" />
                                                <div className="absolute inset-1 bg-zinc-900 rounded-full flex items-center justify-center z-10">
                                                    <span className="text-[10px] font-black text-white italic">POS</span>
                                                </div>
                                                <div className="absolute -bottom-4 left-2 w-4 h-8 bg-indigo-700 rotate-[15deg] z-0 rounded-b-sm" />
                                                <div className="absolute -bottom-4 right-2 w-4 h-8 bg-indigo-700 -rotate-[15deg] z-0 rounded-b-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase tracking-tight">
                                    {awards?.rank ? (
                                        <>You are currently <span className="text-indigo-400">Rank #{awards.rank}</span></>
                                    ) : (
                                        "Calculating Rank..."
                                    )}
                                </h3>
                                <p className="text-zinc-400 font-medium max-w-sm text-lg leading-relaxed">
                                    {awards?.rank && awards.rank <= 6000 ? 
                                        `Amazing! You are qualified for the ${getTargetRewardByRank(awards.rank).name}. Keep maintaining your active sales to secure this reward.` : 
                                        "You need at least 6 active sales to qualify for the top regional prizes. Build your network to climb the leaderboard!"
                                    }
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="px-8 py-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-indigo-500/50 transition-colors">
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Network Score</p>
                                    <p className="text-4xl font-black tracking-tighter">{awards?.rank ? Math.max(0, 1000 - awards.rank * 0.1).toFixed(1) : '0.0'}</p>
                                </div>
                                <div className="px-8 py-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-indigo-500/50 transition-colors">
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Region</p>
                                    <p className="text-4xl font-black tracking-tighter">{awards?.user.country || 'Global'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rank-specific Reward Preview */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            className="relative w-full lg:w-[450px] aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.2)] group"
                        >
                            <NextImage 
                                src={getTargetRewardByRank(awards?.rank || 10000).image}
                                alt="Your Reward"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">
                                    Current Target
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic">
                                    {getTargetRewardByRank(awards?.rank || 10000).name}
                                </h3>
                                <p className="text-zinc-400 text-sm font-medium mt-1">
                                    {getTargetRewardByRank(awards?.rank || 10000).description}
                                </p>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Rewards Showcase Section */}
            <div className="space-y-8">
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Rewards Showcase</h2>
                        <p className="text-sm font-medium text-zinc-500 italic">Target rewards for top performers in your region</p>
                    </div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {TARGET_REWARDS.map((reward) => (
                        <motion.div key={reward.position} variants={itemVariants}>
                            <Card className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                                <div className="relative h-64 overflow-hidden">
                                    <NextImage 
                                        src={reward.image} 
                                        alt={reward.name} 
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent`} />
                                    
                                    <div className="absolute top-6 left-6">
                                        <div className={`px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white shadow-xl`}>
                                            Position {reward.position}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 space-y-1">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                                            {reward.name}
                                        </h3>
                                        <p className="text-zinc-300 text-xs font-medium">
                                            {reward.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Prizes Grid */}
            <div className="space-y-8">
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Achievement Gallery</h2>
                        <p className="text-sm font-medium text-zinc-500">Official rewards issued to your account</p>
                    </div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {/* Combine actual prizes with the current rank reward if they are qualified */}
                    {(() => {
                        const actualPrizes = awards?.prizes?.filter(p => p.type !== 'bonus') || [];
                        const isQualified = awards?.rank && awards.rank <= 6000;
                        
                        // If they have no actual prizes but ARE qualified by rank, show the rank prize as "Won"
                        if (actualPrizes.length === 0 && isQualified) {
                            const reward = getTargetRewardByRank(awards!.rank);
                            return (
                                <motion.div variants={itemVariants} className="col-span-full">
                                    <Card className="group relative overflow-hidden border-none shadow-2xl bg-zinc-900 text-white rounded-[3rem]">
                                        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
                                        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
                                            <div className="relative w-full md:w-1/2 aspect-video rounded-[2rem] overflow-hidden shadow-2xl">
                                                <NextImage 
                                                    src={reward.image} 
                                                    alt={reward.name} 
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute top-6 left-6">
                                                    <div className="px-4 py-2 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                        Position {awards!.rank}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:w-1/2 space-y-6 text-center md:text-left">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                                        <Trophy size={14} />
                                                        Current Winning Prize
                                                    </div>
                                                    <h3 className="text-4xl font-black uppercase tracking-tighter italic">
                                                        {reward.name}
                                                    </h3>
                                                    <p className="text-zinc-400 font-medium text-lg italic">
                                                        Price Value: <span className="text-white font-black">{reward.value}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-center md:justify-start gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                        Winning Status: Confirmed
                                                    </span>
                                                </div>
                                                <Button className="w-full md:w-auto h-14 px-10 rounded-2xl bg-white text-zinc-900 hover:bg-indigo-50 font-black uppercase tracking-widest transition-all">
                                                    Claim Reward
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        }

                        // Otherwise show actual prizes
                        if (actualPrizes.length > 0) {
                            return actualPrizes.map((prize: Prize) => (
                                <motion.div key={prize.id} variants={itemVariants}>
                                    <Card className="group h-full overflow-hidden border-none shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 rounded-[2.5rem]">
                                        <div className="relative h-56 overflow-hidden bg-zinc-50">
                                            <NextImage 
                                                src={getPrizeImage(prize.position, prize.url)} 
                                                alt={prize.name} 
                                                width={400}
                                                height={300}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute top-6 left-6">
                                                <span className="px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-xl border border-white">
                                                    Position {prize.position}
                                                </span>
                                            </div>
                                        </div>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                                    <Sparkles size={12} />
                                                    Verified Achievement
                                                </div>
                                                <h3 className="text-2xl font-black text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter italic">
                                                    {prize.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <MapPin size={14} className="opacity-50" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                                        {prize.location || 'Regional Distribution Center'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                        Status: Claimed
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-bold text-zinc-400">
                                                    {prize.createdAt ? new Date(prize.createdAt).toLocaleDateString() : 'Recent'}
                                                </div>
                                            </div>

                                            <Button className="w-full h-14 rounded-2xl bg-zinc-900 text-white border-none shadow-xl shadow-zinc-200 transition-all hover:bg-indigo-600 active:scale-95 group/btn">
                                                Reward Details
                                                <ChevronRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ));
                        }

                        // Default empty state (Qualification Required)
                        return (
                            <div className="col-span-full py-20 px-8 text-center space-y-8 bg-linear-to-b from-zinc-50 to-white rounded-[4rem] border-2 border-dashed border-zinc-200">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-5xl mx-auto">
                                    <div className="relative w-full md:w-1/2 aspect-video rounded-[3rem] overflow-hidden shadow-2xl group">
                                        <NextImage 
                                            src={getTargetRewardByRank(awards?.rank || 10000).image}
                                            alt="Target Reward"
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute top-6 right-6">
                                            <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black text-white uppercase tracking-widest">
                                                Target Reward
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:w-1/2 text-center md:text-left space-y-8">
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                                <Sparkles size={12} />
                                                Milestone Pending
                                            </div>
                                            <h3 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none">Qualification Required</h3>
                                            <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                                                You need to have at least <span className="text-indigo-600 font-black italic">6 active sales</span> to qualify for the regional leaderboard prizes. 
                                                The <span className="text-zinc-900 font-black italic">{getTargetRewardByRank(awards?.rank || 10000).name}</span> is waiting for the top performer!
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Link href="/dashboard" passHref className="flex-1">
                                                <Button className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95">
                                                    Start Earning
                                                </Button>
                                            </Link>
                                            <Button variant="outline" className="flex-1 h-16 rounded-[1.5rem] border-zinc-200 font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all" onClick={() => refetch()}>
                                                Refresh Status
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>
            </div>

            {/* Bonus Prizes Section */}
            {awards?.prizes && awards.prizes.some(p => p.type === 'bonus') && (
                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Bonus Rewards</h2>
                            <p className="text-sm font-medium text-zinc-500">Extra milestones achieved during your journey</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={containerVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {awards.prizes.filter(p => p.type === 'bonus').map((prize: Prize) => (
                            <motion.div key={prize.id} variants={itemVariants}>
                                <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-zinc-50">
                                    <div className="p-6 space-y-4">
                                        <div className="relative h-40 w-full rounded-2xl overflow-hidden shadow-sm">
                                            <NextImage 
                                                src={prize.url || '/assets/img/awards/trisonet_bonus_ipad.jpeg'} 
                                                alt={prize.name} 
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-zinc-900 uppercase tracking-tight truncate">{prize.name}</h4>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Bonus Achievement</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
