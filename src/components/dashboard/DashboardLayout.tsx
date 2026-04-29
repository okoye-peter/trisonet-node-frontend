'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';
import FinanceVideo from './FinanceVideo';
import KYCModal from './KYCModal';
import { useAppSelector } from '@/store/hooks';
import { useGetUserQuery } from '@/store/api/userApi';
import { useLogout } from '@/hooks/useLogout';
import { ROLES } from '@/types';
import { useGetPatronDashboardQuery, useGetPatronPlansQuery } from '@/store/api/patronApi';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showFinanceVideo, setShowFinanceVideo] = useState(false);
    const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const { refetch: refetchUser } = useGetUserQuery();
    const logout = useLogout();

    const [hasSeenInCurrentVisit, setHasSeenInCurrentVisit] = useState(false);

    useEffect(() => {
        // Finance-related path prefixes
        const financePaths = ['/wallets', '/transactions', '/earnings', '/vtu', '/dashboard/finance'];
        const isFinanceSection = financePaths.some(path => pathname?.startsWith(path));

        if (isFinanceSection && !hasSeenInCurrentVisit && !showFinanceVideo) {
            setTimeout(() => setShowFinanceVideo(true), 0);
        }
    }, [pathname, showFinanceVideo, hasSeenInCurrentVisit]);

    const { data: dashboardData } = useGetPatronDashboardQuery(undefined, { skip: user?.role !== ROLES.PATRON });
    const { data: plansResponse } = useGetPatronPlansQuery(undefined, { skip: user?.role !== ROLES.PATRON });
    const plans = plansResponse?.data || [];
    const patronData = dashboardData?.data;

    useEffect(() => {
        // Redirect restricted group patrons to dashboard if they try to access other patron pages
        const isGroupPatron = user?.role === ROLES.PATRON && user?.pendingPatronType === 'group';
        
        if (isGroupPatron) {
            let isRestricted = false;
            
            if (!patronData?.patronGroup) {
                isRestricted = true;
            } else {
                isRestricted = !patronData.patronGroup.isFunded;
            }

            const isPatronPage = pathname?.startsWith('/patron');
            const isDashboard = pathname === '/patron/dashboard';

            if (isRestricted && isPatronPage && !isDashboard) {
                window.location.href = '/patron/dashboard';
            }
        }
    }, [user, patronData, plans, pathname]);

    useEffect(() => {
        // Auto-show KYC modal if user is a customer and not verified Level 2
        if (user && user.hasVerifiedLevel2 === false && user.role === ROLES.CUSTOMER) {
            const triggerKYC = () => {
                const timer = setTimeout(() => {
                    setIsKYCModalOpen(true);
                }, 1500);
                return timer;
            };

            let timer: NodeJS.Timeout;

            // Coordination logic
            const checkAndTrigger = () => {
                const isDashboard = pathname === '/dashboard';
                const hasSeenWelcome = typeof window !== 'undefined' && sessionStorage.getItem('hasSeenWelcome') === 'true';
                
                // If on finance section, wait for FinanceVideo to finish
                if (showFinanceVideo) return;

                // If on dashboard home, wait for WelcomeVideo to finish
                if (isDashboard && !hasSeenWelcome) return;

                timer = triggerKYC();
            };

            checkAndTrigger();

            // Listen for events that might clear the way for KYC
            const handleVideoEnd = () => checkAndTrigger();
            window.addEventListener('welcomeVideoEnded', handleVideoEnd);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('welcomeVideoEnded', handleVideoEnd);
            };
        }
    }, [user, pathname, showFinanceVideo]);

    const handleFinanceVideoEnded = () => {
        setShowFinanceVideo(false);
        setHasSeenInCurrentVisit(true); // Don't show again until reload
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <AnimatePresence>
                {showFinanceVideo && (
                    <FinanceVideo onEnded={handleFinanceVideoEnded} />
                )}
            </AnimatePresence>
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[140px]" />
            </div>

            <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />


            <main className={cn(
                "pt-28 pb-24 lg:pb-8 transition-all duration-500 relative z-10",
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
                        className="fixed inset-0 z-55 bg-black/40 backdrop-blur-md lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <BottomNav />

            <KYCModal 
                key={user?.id ?? 'kyc-modal'}
                isOpen={isKYCModalOpen}
                isMandatory={user?.hasVerifiedLevel2 === false}
                onClose={() => setIsKYCModalOpen(false)}
                onLogout={logout}
                onSuccess={() => {
                    refetchUser();
                }}
            />
        </div>
    );
}
