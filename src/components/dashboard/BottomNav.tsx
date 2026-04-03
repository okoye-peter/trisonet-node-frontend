'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, User, Settings, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: CheckCircle2, label: 'Winnings', href: '/winnings/status' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pt-2">
            <div className="mx-auto flex h-16 max-w-md items-center justify-around rounded-[2rem] border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.label} 
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-12 h-12 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-0 bg-indigo-600/10 rounded-2xl"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            
                            <div className={cn(
                                "relative z-10 transition-all duration-300",
                                isActive ? "scale-110" : "group-hover:scale-110"
                            )}>
                                <item.icon 
                                    className={cn(
                                        "h-6 w-6 transition-colors duration-300",
                                        isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600"
                                    )} 
                                />
                            </div>

                            {isActive && (
                                <motion.div 
                                    layoutId="bottom-nav-dot"
                                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-indigo-600"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
