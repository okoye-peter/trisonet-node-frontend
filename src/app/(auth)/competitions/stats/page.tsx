'use client'

import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Award, Crown, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    LabelList
} from 'recharts'

interface ReferralUser {
    id: string;
    username: string;
    name: string;
    referralActivateAt: string;
    createdAt?: string;
    _count: {
        referrals: number;
    }
}

const Stats = () => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        React.startTransition(() => {
            setIsMounted(true);
        });
    }, []);

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['competitionTable'],
        queryFn: async () => {
            const res = await api.get('/regions/competitions/top-5-users');
            return res.data;
        }
    })

    const top5: ReferralUser[] = response?.data || [];

    // Prepare data for Recharts
    const chartData = top5.map((user, index) => ({
        name: user.name,
        fullName: `${user.name}`,
        referrals: user._count.referrals,
        rank: index + 1
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary h-6 w-6" />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-8 text-center text-red-500">
                <Card className="max-w-md mx-auto border-red-100 bg-red-50/50">
                    <CardContent className="pt-6 text-center">
                        <p className="font-medium">Failed to load competition data</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm transition-colors hover:bg-primary/90"
                        >
                            Retry
                        </button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto space-y-10"
            >
                <header className="text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4"
                    >
                        <Trophy className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                        Top 5 Sellers in Competition
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Real-time standings of our top community contributors
                    </p>
                </header>

                {/* Chart Section */}
                {isMounted && top5.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-none bg-linear-to-br from-accent/10 to-transparent shadow-sm overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    <CardTitle>Performance Visualization</CardTitle>
                                </div>
                                <CardDescription>Visual breakdown of top 5 sellers distribution</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(var(--primary-rgb), 0.05)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const item = payload[0].payload;
                                                        return (
                                                            <div className="bg-background border border-border p-3 rounded-xl shadow-xl ring-1 ring-black/5">
                                                                <p className="font-bold text-sm mb-1">{item.fullName}</p>
                                                                <p className="text-primary font-black text-lg">
                                                                    {item.referrals} <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Partnership</span>
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground mt-1">Rank #{item.rank}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar 
                                                dataKey="referrals" 
                                                radius={[8, 8, 0, 0]} 
                                                fill="url(#barGradient)"
                                                barSize={60}
                                            >
                                                <LabelList 
                                                    dataKey="referrals" 
                                                    position="top" 
                                                    fill="#3b82f6" 
                                                    fontSize={14} 
                                                    fontWeight={800}
                                                    offset={10}
                                                />
                                                {chartData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fillOpacity={1 - (index * 0.15)} 
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Leaderboard List Section */}
                <div className="grid gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            Leaderboard Standings
                        </h2>
                    </div>
                    <AnimatePresence mode="popLayout">
                        {top5.length > 0 ? (
                            top5.map((user, index) => {
                                const rank = index + 1;
                                const isTop3 = rank <= 3;
                                
                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (index * 0.1) }}
                                        layout
                                    >
                                        <Card className={cn(
                                            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-none bg-accent/5",
                                            isTop3 && "bg-white dark:bg-zinc-900 border border-primary/20 shadow-sm"
                                        )}>
                                            {isTop3 && (
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-1",
                                                    rank === 1 ? "bg-yellow-400" : rank === 2 ? "bg-slate-400" : "bg-orange-400"
                                                )} />
                                            )}
                                            
                                            <CardContent className="p-5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-5">
                                                        <div className={cn(
                                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-lg",
                                                            rank === 1 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                            rank === 2 ? "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" :
                                                            rank === 3 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                                                            "bg-accent text-accent-foreground"
                                                        )}>
                                                            {rank === 1 ? <Crown className="h-5 w-5" /> : rank}
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-bold text-base leading-tight">{user.name}</h3>
                                                                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">@{user.username}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                                <TrendingUp className="h-2.5 w-2.5" />
                                                                Since {new Date(user.referralActivateAt || user.createdAt || '').toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center sm:items-end flex-row sm:flex-col justify-between sm:justify-center gap-1 pt-3 sm:pt-0 border-t sm:border-0 border-muted/50">
                                                        <div className="flex items-center gap-2 sm:justify-end">
                                                            <Users className="h-4 w-4 text-primary" />
                                                            <span className="text-2xl font-black text-primary leading-none">
                                                                {user._count.referrals}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                                                            Confirmed Partnership
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 px-6 border-2 border-dashed border-muted rounded-3xl"
                            >
                                <Users className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-muted-foreground">No data available</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                                    The competition is just getting started. Start inviting friends to see your name here!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <footer className="pt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-muted/30 border border-border/50 backdrop-blur-sm rounded-2xl text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        Live tracking enabled • Next sync in 24h
                    </div>
                </footer>
            </motion.div>
        </div>
    )
}

export default Stats