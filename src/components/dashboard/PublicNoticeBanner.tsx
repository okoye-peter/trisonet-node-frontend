'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetActiveNoticeQuery } from '@/store/api/publicNoticeApi';

export default function PublicNoticeBanner() {
    const { data } = useGetActiveNoticeQuery();
    const notice = data?.data;
    const [isOpen, setIsOpen] = useState(false);

    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
    }, [notice]);

    const dismiss = () => setIsOpen(false);

    if (!mounted || !notice) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                        onClick={dismiss}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl"
                        >
                            {/* Coloured header strip */}
                            <div className="relative bg-linear-to-br from-indigo-600 to-purple-600 px-8 pt-10 pb-14 text-white text-center overflow-hidden">
                                {/* Decorative blobs */}
                                <div className="absolute -top-6 -left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                                <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

                                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                                    <Megaphone className="h-8 w-8 text-white" strokeWidth={1.8} />
                                </div>

                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">
                                    Announcement
                                </p>
                                <h2 className="text-2xl font-black leading-tight tracking-tight">
                                    {notice.title}
                                </h2>
                            </div>

                            {/* Notch connector */}
                            <div className="relative -mt-6 mx-auto h-10 w-10 overflow-hidden">
                                <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-purple-600" />
                                <div className="absolute inset-0 rounded-t-full bg-white" />
                            </div>

                            {/* Body */}
                            <div className="px-8 pb-8 -mt-2 text-center">
                                <p className="text-sm leading-relaxed text-zinc-600">
                                    {notice.text}
                                </p>

                                                <Button
                                    onClick={dismiss}
                                    className="mt-6 w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                                >
                                    Got it
                                </Button>
                            </div>

                            {/* Close icon */}
                            <button
                                onClick={dismiss}
                                className="absolute right-4 top-4 rounded-full p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
