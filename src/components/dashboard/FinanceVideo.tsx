'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface FinanceVideoProps {
    onEnded: () => void;
}

export default function FinanceVideo({ onEnded }: FinanceVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Default to unmuted
    const [mounted, setMounted] = useState(false);

    // Step 1: After mount (client-only), render the portal
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Step 2: Only attempt to play AFTER the portal is rendered (mounted=true)
    // This prevents videoRef.current from being null when play() is called.
    useEffect(() => {
        if (!mounted) return;
        if (!videoRef.current) return;

        // Try to play unmuted first
        videoRef.current.muted = false;
        videoRef.current.play().then(() => {
            console.log('Video playing successfully (unmuted)');
        }).catch(error => {
            console.warn('Unmuted autoplay failed, falling back to muted:', error);
            // Fallback to muted autoplay which is usually allowed
            if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current.play().catch(err => {
                    console.error('Muted play also failed:', err);
                    setIsBlocked(true);
                });
            }
        });
    }, [mounted]);

    const handleStartVideo = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsBlocked(false);
            setIsMuted(false); 
            videoRef.current.muted = false;
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const nextMuted = !isMuted;
            videoRef.current.muted = nextMuted;
            setIsMuted(nextMuted);
        }
    };

    const handleVideoEnd = () => {
        setIsVisible(false);
        setTimeout(onEnded, 500); // Wait for exit animation
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-100000 bg-black flex items-center justify-center overflow-hidden"
                >
                    {/* Neural Loading Overlay - Shows until video is ready */}
                    <AnimatePresence>
                        {!isReady && !isBlocked && (
                            <motion.div 
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950"
                            >
                                <div className="relative">
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-3xl"
                                    />
                                    <div className="relative flex flex-col items-center">
                                        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-6" />
                                        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">
                                            <Sparkles size={14} />
                                            Initializing Finance Hub
                                        </div>
                                        <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ x: "-100%" }}
                                                animate={{ x: "100%" }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className="h-full w-full bg-linear-to-r from-transparent via-indigo-500 to-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.video
                        ref={videoRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isReady ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                        onCanPlayThrough={() => setIsReady(true)}
                        className="w-full h-auto max-h-screen object-cover"
                        src="/Video_Generation_and_Improvement.mp4"
                        autoPlay
                        playsInline
                        muted={isMuted}
                        preload="auto"
                        onEnded={handleVideoEnd}
                    />

                    {/* Gradient Overlay for Text Visibility */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

                    {/* UI Layer */}
                    <AnimatePresence>
                        {isReady && !isBlocked && (
                            <>
                                {/* Volume Toggle - Top Left */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute top-8 left-8 z-20 flex gap-4"
                                >
                                    <button 
                                        onClick={toggleMute}
                                        className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl"
                                    >
                                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <div className="hidden sm:flex items-center gap-3 px-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Experience Mode: {isMuted ? 'Muted' : 'Surround'}</span>
                                    </div>
                                </motion.div>

                                {/* Unmute Pulse - Center Middle (Only if muted) */}
                                {isMuted && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.2 }}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                    >
                                        <button 
                                            onClick={toggleMute}
                                            className="pointer-events-auto group relative flex flex-col items-center gap-4"
                                        >
                                            <div className="relative">
                                                <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                                                <div className="h-20 w-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 text-white group-hover:scale-110 transition-transform shadow-2xl">
                                                    <Volume2 size={32} />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 drop-shadow-lg">Tap for Sound</span>
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>

                    {/* Autoplay blocked fallback overlay (Extreme case) */}
                    <AnimatePresence>
                        {isBlocked && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-100001 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
                            >
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="max-w-md"
                                >
                                    <div className="relative group cursor-pointer mb-10" onClick={handleStartVideo}>
                                        <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all duration-500" />
                                        <div className="relative h-28 w-28 bg-linear-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform active:scale-95">
                                            <Play className="text-white h-12 w-12 fill-current ml-1.5" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 mb-4 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">
                                        <Sparkles size={14} />
                                        Financial Intelligence
                                    </div>
                                    <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
                                        Your Earnings, <br/>Redefined.
                                    </h2>
                                    <p className="text-zinc-400 font-medium mb-10 text-lg">Experience the future of personal wealth management and real-time revenue distributions.</p>
                                    
                                    <button 
                                        onClick={handleStartVideo}
                                        className="h-16 px-12 rounded-2xl bg-white text-indigo-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-95"
                                    >
                                        Start Experience
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Skip button - always available */}
                    {!isBlocked && (isReady) && (
                        <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-6 z-100002">
                             <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Financial Overview</div>
                                <button 
                                    onClick={handleVideoEnd}
                                    className="px-10 py-4 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-md transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl"
                                >
                                    Skip Introduction
                                </button>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
