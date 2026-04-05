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
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnd}
                    />

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
