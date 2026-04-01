'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Menu, Search, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/features/authSlice';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'EK';

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl transition-all duration-300">
            <div className="flex h-20 items-center justify-between px-6 sm:px-10 lg:px-12">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="rounded-xl p-2 text-zinc-500 transition-all hover:bg-zinc-100/80 active:scale-95 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-lg blur-sm opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <Image src="/logo.png" alt="TrisoNet" width={32} height={32} className="relative object-contain" />
                        </div>
                        <span className="hidden text-xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 sm:block">
                            TrisoNet
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    {/* <div className="relative hidden md:block group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={18} className="text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-64 rounded-2xl border-none bg-zinc-100/50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:shadow-sm"
                        />
                    </div> */}

                    <div className="relative">
                        <NotificationCenter />
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 border-l border-zinc-200/60 pl-4 sm:pl-6 group hover:opacity-80 transition-opacity outline-none"
                        >
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-bold text-zinc-800 leading-none">{user?.name || 'User'}</p>
                                <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">ID: {user?.id?.slice(0, 8) || 'TRN-2849'}</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-linear-to-br from-indigo-500 to-purple-500 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition duration-300"></div>
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 font-black text-white shadow-lg shadow-indigo-200/50">
                                    {initials}
                                </div>
                            </div>
                            <ChevronDown
                                size={14}
                                className={`hidden text-zinc-400 sm:block transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute right-0 mt-4 w-56 overflow-hidden rounded-2xl border border-white/40 bg-white/90 p-2 backdrop-blur-xl shadow-2xl shadow-zinc-200/50"
                                >
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                                            <User size={18} />
                                        </div>
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500">
                                            <Settings size={18} />
                                        </div>
                                        Settings
                                    </Link>
                                    <div className="my-1 h-px bg-zinc-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                                            <LogOut size={18} />
                                        </div>
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
