'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Film, 
    Volume2, 
    VolumeX, 
    Play, 
    Pause, 
    ChevronLeft, 
    Loader2, 
    Sparkles, 
    Home 
} from 'lucide-react';
import Link from 'next/link';
import { useGetReelsQuery, type Reel } from '@/store/api/reelApi';
import { cn } from '@/lib/utils';

export default function ReelsPage() {
    const [page, setPage] = useState(1);
    const [reels, setReels] = useState<Reel[]>([]);
    const [isMuted, setIsMuted] = useState(true); // Default to muted for autoplay permission compliance
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const [pausedVideos, setPausedVideos] = useState<Record<number, boolean>>({});

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

    const { data: reelsResponse, isLoading, isFetching } = useGetReelsQuery({ page, limit: 5 });

    // Handle appending new reels when pagination updates
    useEffect(() => {
        if (reelsResponse?.data?.data) {
            const fetchedReels = reelsResponse.data.data;
            setReels((prev) => {
                // Filter out any duplicates
                const prevIds = new Set(prev.map(r => r.id));
                const uniqueNewReels = fetchedReels.filter(r => !prevIds.has(r.id));
                return [...prev, ...uniqueNewReels];
            });
        }
    }, [reelsResponse]);

    // Setup intersection observer to detect the active reel on screen
    useEffect(() => {
        const container = containerRef.current;
        if (!container || reels.length === 0) return;

        const observerOptions = {
            root: container,
            rootMargin: '0px',
            threshold: 0.6, // Reel is active if 60% is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const target = entry.target as HTMLElement;
                const index = Number(target.dataset.index);
                if (entry.isIntersecting) {
                    setActiveVideoIndex(index);
                }
            });
        }, observerOptions);

        // Observe each reel element
        const children = container.querySelectorAll('[data-index]');
        children.forEach((child) => observer.observe(child));

        return () => {
            children.forEach((child) => observer.unobserve(child));
            observer.disconnect();
        };
    }, [reels]);

    // Manage play/pause of videos based on active index
    useEffect(() => {
        reels.forEach((reel, idx) => {
            const video = videoRefs.current[idx];
            if (!video || reel.fileType !== 'video') return;

            if (idx === activeVideoIndex) {
                // Mute state
                video.muted = isMuted;

                // Play if not manually paused
                if (!pausedVideos[idx]) {
                    video.play().catch((err) => {
                        console.warn('Autoplay failed or prevented:', err);
                    });
                }
            } else {
                // Pause other videos
                video.pause();
            }
        });
    }, [activeVideoIndex, isMuted, pausedVideos, reels]);

    // Trigger loading next page of reels on scroll near end
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const threshold = 100; // Pixels from bottom
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;

        if (isNearBottom && !isLoading && !isFetching) {
            const lastPage = reelsResponse?.data?.last_page || 1;
            if (page < lastPage) {
                setPage((prev) => prev + 1);
            }
        }
    };

    const togglePlay = (index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;

        const isCurrentlyPaused = pausedVideos[index] || video.paused;
        if (isCurrentlyPaused) {
            video.play().catch(e => console.log(e));
            setPausedVideos((prev) => ({ ...prev, [index]: false }));
        } else {
            video.pause();
            setPausedVideos((prev) => ({ ...prev, [index]: true }));
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted((prev) => !prev);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#020617] text-white flex flex-col md:flex-row select-none">
            {/* Header Dashboard Control - Premium glass design */}
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
                        {isMuted ? <VolumeX size={20} className="text-rose-400" /> : <Volume2 size={20} className="text-emerald-400" />}
                    </button>
                </div>
            </div>

            {/* Vertical Snap-Scrolling Container */}
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none flex-1"
                style={{ scrollbarWidth: 'none' }}
            >
                <div className="flex flex-col items-center">
                    {reels.map((reel, index) => {
                        const isCurrentActive = index === activeVideoIndex;
                        const isManualPaused = pausedVideos[index];

                        return (
                            <div 
                                key={reel.id}
                                data-index={index}
                                className="relative flex items-center justify-center w-full h-screen snap-start snap-always max-w-lg md:max-w-xl mx-auto border-x border-white/5 bg-zinc-950 overflow-hidden"
                            >
                                {/* Media Content */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {reel.fileType === 'video' ? (
                                        <video
                                            ref={(el) => { videoRefs.current[index] = el; }}
                                            src={reel.url}
                                            className="w-full h-full object-cover cursor-pointer"
                                            loop
                                            muted={isMuted}
                                            playsInline
                                            onClick={() => togglePlay(index)}
                                        />
                                    ) : (
                                        <img 
                                            src={reel.url}
                                            alt={`Reel ${reel.id}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Custom Floating Control Play Indicator */}
                                <AnimatePresence>
                                    {reel.fileType === 'video' && isManualPaused && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.6 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.2 }}
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                        >
                                            <div className="h-20 w-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white shadow-2xl">
                                                <Play size={32} className="fill-current ml-1" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Ambient Vignette Gradient */}
                                <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/50 via-transparent to-black/70" />

                                {/* Glass Overlay & Dynamic Tags */}
                                <div className="absolute bottom-8 left-4 right-4 z-20 flex flex-col gap-4">
                                    {/* Intelligence Badge */}
                                    <div className="flex items-center gap-2 self-start px-3 py-1.5 rounded-xl bg-indigo-600/30 backdrop-blur-md border border-indigo-500/30 text-[8px] font-black uppercase tracking-widest text-indigo-300">
                                        <Sparkles size={10} />
                                        Exclusive Insight
                                    </div>

                                    {/* Reel Information Container */}
                                    <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-black uppercase">
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

                    {/* Loader at bottom */}
                    {isFetching && (
                        <div className="w-full h-24 bg-black flex items-center justify-center text-zinc-500 gap-2">
                            <Loader2 className="animate-spin h-5 w-5 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Loading Intel...</span>
                        </div>
                    )}

                    {/* End of content */}
                    {!isFetching && reels.length > 0 && reelsResponse?.data?.current_page === reelsResponse?.data?.last_page && (
                        <div className="w-full py-16 bg-black flex flex-col items-center justify-center text-zinc-500 border-t border-white/5">
                            <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                                <Sparkles size={16} className="text-zinc-600 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">All Updates Retreived</span>
                            <span className="text-[9px] text-zinc-600 mt-1 font-medium">Enjoy wealth building! 🎉</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Empty State */}
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

            {/* General Loader */}
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
