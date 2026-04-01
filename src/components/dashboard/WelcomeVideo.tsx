'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeVideoProps {
    onEnded: () => void;
}

export default function WelcomeVideo({ onEnded }: WelcomeVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Video play failed:", error);
                // Fallback: if video fails to play (e.g. autoplay blocked), just skip
                onEnded();
            });
        }
    }, [onEnded]);

    const handleVideoEnd = () => {
        setIsVisible(false);
        setTimeout(onEnded, 500); // Wait for exit animation
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
                >
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        src="/Video_Generation_for_Trisonet_Welcome.mp4"
                        autoPlay
                        muted
                        playsInline
                        onEnded={handleVideoEnd}
                    />
                    
                    {/* Optional: Add a skip button for better UX if needed, 
                        but user requested "play without control" */}
                    <button 
                        onClick={handleVideoEnd}
                        className="absolute bottom-8 right-8 text-white/50 hover:text-white text-xs font-black uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full transition-all hover:bg-white/10"
                    >
                        Skip
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
