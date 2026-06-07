'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Film,
    Volume2,
    VolumeX,
    Play,
    ChevronLeft,
    Loader2,
    Sparkles,
    Home
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useGetReelsQuery, type Reel } from '@/store/api/reelApi';

export default function ReelsPage() {
    const [page, setPage] = useState(1);
    const [isMuted, setIsMuted] = useState(true);
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const [pausedVideos, setPausedVideos] = useState<Record<number, boolean>>({});

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
    const progressRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const activeIndexRef = useRef<number | null>(null);
    const pageCacheRef = useRef<Record<number, Reel[]>>({});

    const { data: reelsResponse, isLoading, isFetching } = useGetReelsQuery({ page, limit: 5 });

    if (reelsResponse?.data?.data) {
        pageCacheRef.current[page] = reelsResponse.data.data;
    }

    const reels = useMemo<Reel[]>(() => {
        const seen = new Set<string | number>();
        return Object.keys(pageCacheRef.current)
            .map(Number)
            .sort((a, b) => a - b)
            .flatMap(p => pageCacheRef.current[p])
            .filter(r => {
                if (seen.has(r.id)) return false;
                seen.add(r.id);
                return true;
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reelsResponse, page]);

    // Keep activeIndexRef in sync for use inside event handlers without stale closures
    useEffect(() => {
        activeIndexRef.current = activeVideoIndex;
    }, [activeVideoIndex]);

    // Intersection observer: detect which reel is on screen
    useEffect(() => {
        const container = containerRef.current;
        if (!container || reels.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const target = entry.target as HTMLElement;
                const index = Number(target.dataset.index);
                if (entry.isIntersecting) {
                    setActiveVideoIndex(index);
                    // Reset progress bar for newly active reel
                    const bar = progressRefs.current[index];
                    if (bar) bar.style.width = '0%';
                }
            });
        }, { root: container, rootMargin: '0px', threshold: 0.6 });

        const children = container.querySelectorAll('[data-index]');
        children.forEach((child) => observer.observe(child));

        return () => observer.disconnect();
    }, [reels]);

    // Play / pause videos based on which reel is active
    useEffect(() => {
        reels.forEach((reel, idx) => {
            const video = videoRefs.current[idx];
            if (!video || reel.fileType !== 'video') return;

            if (idx === activeVideoIndex) {
                if (!pausedVideos[idx]) {
                    video.play().catch(err => console.warn('Autoplay blocked:', err));
                }
            } else {
                video.pause();
                video.currentTime = 0;
                const bar = progressRefs.current[idx];
                if (bar) bar.style.width = '0%';
            }
        });
    }, [activeVideoIndex, pausedVideos, reels]);

    // Fix: React's `muted` prop does NOT update the DOM muted property on re-renders.
    // Always set video.muted imperatively via a dedicated effect.
    useEffect(() => {
        Object.values(videoRefs.current).forEach(video => {
            if (video) video.muted = isMuted;
        });
    }, [isMuted]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

        if (isNearBottom && !isLoading && !isFetching) {
            const lastPage = reelsResponse?.data?.last_page || 1;
            if (page < lastPage) setPage(prev => prev + 1);
        }
    };

    // Update progress bar directly in the DOM — avoids per-frame React re-renders
    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>, index: number) => {
        if (index !== activeIndexRef.current) return;
        const video = e.currentTarget;
        if (video.duration > 0) {
            const pct = (video.currentTime / video.duration) * 100;
            const bar = progressRefs.current[index];
            if (bar) bar.style.width = `${pct}%`;
        }
    };

    const togglePlay = (index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;

        if (video.paused) {
            video.play().catch(e => console.log(e));
            setPausedVideos(prev => ({ ...prev, [index]: false }));
        } else {
            video.pause();
            setPausedVideos(prev => ({ ...prev, [index]: true }));
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(prev => !prev);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
                <Link
                    href="/dashboard"
                    className="pointer-events-auto group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-white shadow-2xl"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    <Home size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none hidden sm:inline">Dashboard</span>
                </Link>

                <div className="pointer-events-auto flex items-center gap-4">
                    <button
                        onClick={toggleMute}
                        className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                        {isMuted
                            ? <VolumeX size={20} className="text-rose-400" />
                            : <Volume2 size={20} className="text-emerald-400" />
                        }
                    </button>
                </div>
            </div>

            {/* Vertical snap-scroll container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <div className="flex flex-col items-center">
                    {reels.map((reel, index) => {
                        const isCurrentActive = index === activeVideoIndex;
                        const isManualPaused = !!pausedVideos[index];

                        return (
                            <div
                                key={reel.id}
                                data-index={index}
                                className="relative flex items-center justify-center w-full h-screen snap-start snap-always max-w-lg md:max-w-xl mx-auto bg-black overflow-hidden"
                            >
                                {/* Instagram-style top progress bar */}
                                {reel.fileType === 'video' && (
                                    <div className="absolute top-0 left-0 right-0 h-[3px] z-30 bg-white/20">
                                        <div
                                            ref={el => { progressRefs.current[index] = el; }}
                                            className="h-full bg-white"
                                            style={{ width: '0%', transition: 'none' }}
                                        />
                                    </div>
                                )}

                                {/* Media */}
                                <div className="absolute inset-0 bg-black flex items-center justify-center">
                                    {reel.fileType === 'video' ? (
                                        <video
                                            ref={el => { videoRefs.current[index] = el; }}
                                            src={reel.url}
                                            className="w-full h-full object-cover cursor-pointer"
                                            loop
                                            muted            // always muted in markup — mute state is controlled imperatively
                                            playsInline
                                            preload={isCurrentActive || index === (activeVideoIndex ?? 0) + 1 ? 'auto' : 'metadata'}
                                            onTimeUpdate={e => handleTimeUpdate(e, index)}
                                            onClick={() => togglePlay(index)}
                                        />
                                    ) : (
                                        <Image
                                            src={reel.url}
                                            alt={`Reel ${reel.id}`}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Pause indicator */}
                                <AnimatePresence>
                                    {reel.fileType === 'video' && isManualPaused && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.6 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                        >
                                            <div className="h-20 w-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white shadow-2xl">
                                                <Play size={32} className="fill-current ml-1" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Vignette overlay */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/75" />

                                {/* Muted indicator — tap to unmute hint, only shown on first active reel */}
                                <AnimatePresence>
                                    {isCurrentActive && isMuted && index === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: 1, duration: 0.3 }}
                                            className="absolute top-16 right-4 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white/70 uppercase tracking-widest"
                                        >
                                            <VolumeX size={10} />
                                            Tap to unmute
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Bottom info overlay */}
                                <div className="absolute bottom-8 left-4 right-4 z-20 flex flex-col gap-4">
                                    <div className="flex items-center gap-2 self-start px-3 py-1.5 rounded-xl bg-indigo-600/30 backdrop-blur-md border border-indigo-500/30 text-[8px] font-black uppercase tracking-widest text-indigo-300">
                                        <Sparkles size={10} />
                                        Exclusive Insight
                                    </div>

                                    <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-black uppercase">
                                                T
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold tracking-tight text-white leading-tight">Trisonet Official</h4>
                                                <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">System Broadcast</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-200 font-medium leading-relaxed mt-2 line-clamp-3">
                                            Experience the latest updates, achievements, and intelligence from the ecosystem. Keep scrolling for more premium insights!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isFetching && (
                        <div className="w-full h-24 bg-black flex items-center justify-center text-zinc-500 gap-2">
                            <Loader2 className="animate-spin h-5 w-5 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Loading Intel...</span>
                        </div>
                    )}

                    {!isFetching && reels.length > 0 && reelsResponse?.data?.current_page === reelsResponse?.data?.last_page && (
                        <div className="w-full py-16 bg-black flex flex-col items-center justify-center text-zinc-500 border-t border-white/5">
                            <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                                <Sparkles size={16} className="text-zinc-600 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">All Updates Retrieved</span>
                            <span className="text-[9px] text-zinc-600 mt-1 font-medium">Enjoy wealth building! 🎉</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Empty state */}
            {!isLoading && reels.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] p-8 text-center">
                    <div className="relative group mb-8">
                        <div className="absolute -inset-6 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
                        <div className="relative h-24 w-24 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800 text-zinc-600">
                            <Film size={40} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">
                        <Sparkles size={14} />
                        Intelligence Feed
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-white mb-2 leading-tight">No Reels Published</h2>
                    <p className="text-zinc-400 font-medium text-sm max-w-xs mb-8">Ecosystem insights are curated live. Please check back later for new updates.</p>
                    <Link
                        href="/dashboard"
                        className="px-10 py-5 rounded-2xl bg-white text-indigo-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-zinc-100 active:scale-95"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            )}

            {/* Initial loading state */}
            {isLoading && reels.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#020617]">
                    <div className="relative">
                        <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                        <div className="relative flex flex-col items-center">
                            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-6" />
                            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">
                                <Sparkles size={14} />
                                Curating Reels Feed
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
