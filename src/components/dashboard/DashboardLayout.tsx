'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[140px]" />
            </div>

            <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} />

            <main className={cn(
                "pt-28 pb-8 transition-all duration-500 relative z-10",
                "lg:ml-64 px-4 sm:px-6 lg:px-10"
            )}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </main>

            {/* Floating Chat Bubble */}
            {/* <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
            >
                <div className="hidden sm:block rounded-2xl bg-white/80 backdrop-blur-md px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-800 shadow-2xl shadow-zinc-200/50 border border-white/40 animate-bounce">
                    We Are Here!
                </div>
                <button className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-200/40 transition-all hover:scale-110 active:scale-95">
                    <div className="absolute inset-0 rounded-full bg-emerald-500 group-hover:animate-ping opacity-20" />
                    <MessageCircle size={28} className="relative transition-transform group-hover:rotate-12" />
                </button>
            </motion.div> */}

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-md lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
