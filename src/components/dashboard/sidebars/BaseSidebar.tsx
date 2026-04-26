'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { SidebarItem, SidebarProps } from './types';

interface BaseSidebarProps extends SidebarProps {
    items: SidebarItem[];
    isKycVerified?: boolean;
}

export function BaseSidebar({ isOpen, onClose, items, isKycVerified = true }: BaseSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Automatically open parent menu if a sub-item is active
    useEffect(() => {
        items.forEach(item => {
            if (item.subItems?.some(sub => pathname === sub.href)) {
                setOpenMenus(prev => prev.includes(item.label) ? prev : [...prev, item.label]);
            }
        });
    }, [pathname, items]);

    const toggleMenu = (label: string, href?: string) => {
        setOpenMenus(prev =>
            prev.includes(label)
                ? prev.filter(m => m !== label)
                : [...prev, label]
        );
        if (href && href !== '#') {
            router.push(href);
        }
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-20 z-60 h-[calc(100vh-80px)] w-64 rounded-none border-r border-white/40 bg-white/80 backdrop-blur-xl transition-all duration-500 lg:translate-x-0 shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
                !isOpen && "-translate-x-full"
            )}
        >
            <div className="h-full overflow-y-auto px-4 py-6 custom-scrollbar">
                <ul className="space-y-1.5">
                    {items.map((item, index) => {
                        const isSubMenuActive = item.subItems?.some(sub => pathname === sub.href);
                        const isActive = pathname === item.href || isSubMenuActive;
                        const isMenuOpen = openMenus.includes(item.label);

                        return (
                            <motion.li
                                key={item.label}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {item.hasSubmenu ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (isKycVerified || item.href === '/dashboard' || item.label === 'Finance') {
                                                    toggleMenu(item.label, item.href);
                                                }
                                            }}
                                            className={cn(
                                                "group relative flex w-full items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-300 overflow-hidden",
                                                isActive
                                                    ? "text-white shadow-lg shadow-indigo-200"
                                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600",
                                                !isKycVerified && item.href !== '/dashboard' && item.label !== 'Finance' && "opacity-50 cursor-not-allowed group/locked"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active"
                                                    className="absolute inset-0 bg-linear-to-r from-indigo-600/90 to-indigo-500/90 z-0"
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}

                                            <div className="relative z-10 flex items-center">
                                                <item.icon className={cn(
                                                    "h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
                                                    isActive ? "text-white" : "text-zinc-400 group-hover:text-indigo-600"
                                                )} />
                                                <span className="ml-3 text-[13px] tracking-tight">{item.label}</span>
                                            </div>

                                            <div className="relative z-10">
                                                {!isKycVerified && item.href !== '/dashboard' && item.label !== 'Finance' ? (
                                                    <Lock className="h-3.5 w-3.5 text-zinc-300 group-hover/locked:text-zinc-400 transition-colors" />
                                                ) : (
                                                    <ChevronRight className={cn(
                                                        "h-3.5 w-3.5 transition-transform duration-300",
                                                        isMenuOpen && "rotate-90",
                                                        isActive ? "text-white" : "text-zinc-300 group-hover:text-indigo-600"
                                                    )} />
                                                )}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isMenuOpen && (
                                                <motion.ul
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden bg-zinc-50/50 rounded-xl mt-1 space-y-1"
                                                >
                                                    {item.subItems?.map((sub) => {
                                                        const isSubActive = pathname === sub.href;
                                                        return (
                                                            <li key={sub.label}>
                                                                <Link
                                                                    href={sub.href}
                                                                    onClick={onClose}
                                                                    className={cn(
                                                                        "flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold transition-all duration-200 rounded-lg mx-2",
                                                                        isSubActive
                                                                            ? "text-indigo-600 bg-indigo-50/80"
                                                                            : "text-zinc-400 hover:text-indigo-600 hover:bg-white"
                                                                    )}
                                                                >
                                                                    <sub.icon size={14} className={cn(isSubActive ? "opacity-100" : "opacity-40")} />
                                                                    {sub.label}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <Link
                                        href={isKycVerified || item.href === '/dashboard' || item.href === '/patron/dashboard' ? item.href : '#'}
                                        onClick={(e) => {
                                            if (!isKycVerified && item.href !== '/dashboard' && item.href !== '/patron/dashboard') {
                                                e.preventDefault();
                                            } else {
                                                onClose?.();
                                            }
                                        }}
                                        className={cn(
                                            "group relative flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-300 overflow-hidden",
                                            isActive
                                                ? "text-white shadow-lg shadow-indigo-200"
                                                : "text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600",
                                            !isKycVerified && item.href !== '/dashboard' && item.href !== '/patron/dashboard' && "opacity-50 cursor-not-allowed group/locked"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-linear-to-r from-indigo-600/90 to-indigo-500/90 z-0"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}

                                        <div className="relative z-10 flex items-center">
                                            <item.icon className={cn(
                                                "h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
                                                isActive ? "text-white" : "text-zinc-400 group-hover:text-indigo-600"
                                            )} />
                                            <span className="ml-3 text-[13px] tracking-tight">{item.label}</span>
                                        </div>

                                        <div className="relative z-10 flex items-center gap-2">
                                            {!isKycVerified && item.href !== '/dashboard' && item.href !== '/patron/dashboard' ? (
                                                <Lock className="h-3.5 w-3.5 text-zinc-300 group-hover/locked:text-zinc-400 transition-colors" />
                                            ) : item.badge !== undefined && item.badge > 0 && (
                                                <span className={cn(
                                                    "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black tracking-tighter",
                                                    isActive ? "bg-white/20 text-white" : "bg-red-500 text-white shadow-lg shadow-red-200"
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                )}
                            </motion.li>
                        );
                    })}
                </ul>

                {/* Bottom Card */}
                <div className="mt-10 px-2 pb-4">
                    <div className="relative rounded-2xl bg-indigo-950 p-4 overflow-hidden group">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl transition-transform group-hover:scale-110" />
                        <p className="relative z-10 text-xs font-bold text-indigo-200 uppercase tracking-widest">Plan Details</p>
                        <p className="relative z-10 mt-1 text-sm font-bold text-white leading-snug">Unlock advanced community features today.</p>
                        <button disabled className="relative z-10 mt-4 w-full rounded-xl bg-white py-2 text-xs font-black text-indigo-950 shadow-lg hover:bg-zinc-100 transition-colors">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
