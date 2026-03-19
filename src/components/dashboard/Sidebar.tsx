import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Mail,
    Trophy,
    User,
    CreditCard,
    Users,
    CircleDollarSign,
    PieChart,
    CheckCircle2,
    FileText,
    Globe,
    ShoppingBag,
    ChevronRight,
    ArrowRightLeft,
    ScrollText,
    Receipt,
    Wallet,
    Briefcase,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const sidebarItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Mail, label: 'Inbox', href: '/dashboard/inbox', badge: 0 },
    { icon: Trophy, label: 'Winning Range', href: '/competitions/stats' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: CreditCard, label: 'PIM Credit Cards', href: '/activation-cards' },
    { icon: Users, label: 'Wards', href: '/wards' },
    { icon: CircleDollarSign, label: 'Wards Fees', href: '/wards/fees' },
    {
        icon: PieChart,
        label: 'Finance',
        href: '/dashboard/finance',
        hasSubmenu: true,
        subItems: [
            { label: 'Transfers', href: '/wallets/transfers', icon: ArrowRightLeft },
            { label: 'Transactions', href: '/withdrawals', icon: ScrollText },
            { label: 'Utility Bills', href: '/vtu', icon: Receipt },
            { label: 'Wallet', href: '/wallets', icon: Wallet },
            { label: 'Gkwth Business', href: '/wallets/gkwth', icon: Briefcase },
            { label: 'Upfront Sales', href: '/dashboard/finance/upfront-sales', icon: TrendingUp },
        ]
    },
    { icon: CheckCircle2, label: 'Winning Status', href: '/dashboard/status' },
    { icon: FileText, label: 'TrisoBrief', href: '/dashboard/brief' },
    { icon: Globe, label: 'Gist Zone', href: '/dashboard/gist' },
    { icon: ShoppingBag, label: 'Shopping mall', href: '/dashboard/mall' },
];

export function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Automatically open parent menu if a sub-item is active
    useEffect(() => {
        sidebarItems.forEach(item => {
            if (item.subItems?.some(sub => pathname === sub.href)) {
                if (!openMenus.includes(item.label)) {
                    setOpenMenus(prev => [...prev, item.label]);
                }
            }
        });
    }, [pathname]);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label)
                ? prev.filter(m => m !== label)
                : [...prev, label]
        );
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-20 z-40 h-[calc(100vh-80px)] w-64 rounded-none border-r border-white/40 bg-white/80 backdrop-blur-xl transition-all duration-500 lg:translate-x-0 shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
                !isOpen && "-translate-x-full"
            )}
        >
            <div className="h-full overflow-y-auto px-4 py-6 custom-scrollbar">
                <ul className="space-y-1.5">
                    {sidebarItems.map((item, index) => {
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
                                            onClick={() => toggleMenu(item.label)}
                                            className={cn(
                                                "group relative flex w-full items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-300 overflow-hidden",
                                                isActive
                                                    ? "text-white shadow-lg shadow-indigo-200"
                                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600"
                                            )}
                                        >
                                            {/* Active Background & Glow */}
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
                                                <ChevronRight className={cn(
                                                    "h-3.5 w-3.5 transition-transform duration-300",
                                                    isMenuOpen && "rotate-90",
                                                    isActive ? "text-white" : "text-zinc-300 group-hover:text-indigo-600"
                                                )} />
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
                                        href={item.href}
                                        className={cn(
                                            "group relative flex items-center justify-between rounded-xl p-3 text-sm font-semibold transition-all duration-300 overflow-hidden",
                                            isActive
                                                ? "text-white shadow-lg shadow-indigo-200"
                                                : "text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600"
                                        )}
                                    >
                                        {/* Active Background & Glow */}
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
                                            {item.badge !== undefined && item.badge > 0 && (
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

                {/* Bottom Card (Premium Ad/CT) */}
                <div className="mt-10 px-2">
                    <div className="relative rounded-2xl bg-indigo-950 p-4 overflow-hidden group">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl transition-transform group-hover:scale-110" />
                        <p className="relative z-10 text-xs font-bold text-indigo-200 uppercase tracking-widest">Premium Plan</p>
                        <p className="relative z-10 mt-1 text-sm font-bold text-white leading-snug">Unlock advanced financial reports today.</p>
                        <button className="relative z-10 mt-4 w-full rounded-xl bg-white py-2 text-xs font-black text-indigo-950 shadow-lg hover:bg-zinc-100 transition-colors">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
