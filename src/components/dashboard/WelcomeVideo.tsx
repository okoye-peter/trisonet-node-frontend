'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

interface WelcomeVideoProps {
    onEnded: () => void;
}

export default function WelcomeVideo({ onEnded }: WelcomeVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Video play failed (blocked by browser):", error);
                setIsBlocked(true);
            });
        }
    }, []);

    const handleStartVideo = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsBlocked(false);
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
                    className="fixed inset-0 z-99999 bg-black flex items-center justify-center overflow-hidden"
                >
                    <video
                        ref={videoRef}
                        className="w-full h-auto max-h-screen object-cover"
                        src="/Avatar_Walks_Into_Community.mp4"
                        autoPlay
                        muted={isMuted}
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnd}
                    />

                    {/* Volume toggle */}
                    {!isBlocked && (
                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className="absolute bottom-8 left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all z-100001 group"
                        >
                            {isMuted ? (
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block transition-all">Unmute</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block transition-all">Mute</span>
                                </div>
                            )}
                        </button>
                    )}

                    {/* Autoplay blocked fallback overlay */}
                    <AnimatePresence>
                        {isBlocked && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-100000 bg-black/80 flex flex-col items-center justify-center text-center p-6"
                            >
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="max-w-md"
                                >
                                    <div className="h-24 w-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/50 cursor-pointer hover:scale-110 transition-transform active:scale-95"
                                         onClick={handleStartVideo}>
                                        <Play className="text-white h-10 w-10 fill-current ml-1" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tight mb-4">Welcome to Trisonet</h2>
                                    <p className="text-zinc-400 font-medium mb-8">Tap below to experience our vision with sound.</p>
                                    <button 
                                        onClick={handleStartVideo}
                                        className="h-14 px-10 rounded-2xl bg-white text-indigo-950 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:bg-zinc-100 active:scale-95"
                                    >
                                        Start Presentation
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Skip button - always available */}
                    {!isBlocked && (
                        <button 
                            onClick={handleVideoEnd}
                            className="absolute bottom-8 right-8 text-white/50 hover:text-white text-xs font-black uppercase tracking-widest border border-white/20 px-6 py-3 rounded-full transition-all hover:bg-white/10 backdrop-blur-sm z-100001"
                        >
                            Skip Presentation
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
