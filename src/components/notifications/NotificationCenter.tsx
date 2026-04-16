'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Clock, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
    useGetNotificationsQuery, 
    useMarkNotificationReadMutation, 
    useMarkAllNotificationsReadMutation 
} from '@/store/api/notificationApi';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    
    const { data: response, isLoading } = useGetNotificationsQuery({ limit: 10 });
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead] = useMarkAllNotificationsReadMutation();

    const notifications = response?.data?.notifications || [];
    const unreadCount = response?.data?.unreadCount || 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id: string, navigate: boolean = false) => {
        try {
            await markRead(id).unwrap();
            if (navigate) {
                setIsOpen(false);
                router.push(`/notifications/${id}`);
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            // Fallback navigation if marking fails
            if (navigate) {
                setIsOpen(false);
                router.push(`/notifications/${id}`);
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead().unwrap();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative rounded-xl p-2.5 text-zinc-400 transition-all hover:bg-zinc-100/80 hover:text-zinc-600 active:scale-95",
                    isOpen && "bg-zinc-100/80 text-zinc-800"
                )}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-[8px] font-bold text-white ring-4 ring-indigo-500/10">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:mt-4 sm:w-80 lg:w-96 overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl shadow-zinc-200/50 z-50 transform origin-top sm:origin-top-right"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 p-5 sm:p-6">
                            <div>
                                <h3 className="text-lg font-black text-zinc-800">Notifications</h3>
                                <p className="text-xs font-medium text-zinc-400 mt-0.5">
                                    You have {unreadCount} unread messages
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllRead}
                                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 transition-colors hover:bg-indigo-100"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[45vh] sm:max-h-[70vh] overflow-y-auto scrollbar-hide py-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-500" />
                                    <p className="text-sm font-bold text-zinc-400">Loading your alerts...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.slice(0, 5).map((notification) => (
                                    <div 
                                        key={notification.id}
                                        onClick={() => handleMarkRead(notification.id, true)}
                                        className={cn(
                                            "group relative flex gap-4 px-6 py-4 transition-all hover:bg-zinc-50 cursor-pointer",
                                            !notification.status && "bg-indigo-50/10 hover:bg-indigo-50/30"
                                        )}
                                    >
                                        {!notification.status && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                        )}
                                        
                                        <div className={cn(
                                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                                            !notification.status ? "bg-indigo-50 text-indigo-600" : "bg-zinc-50 text-zinc-400"
                                        )}>
                                            <Bell size={20} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className={cn(
                                                    "text-sm font-bold truncate",
                                                    !notification.status ? "text-zinc-900" : "text-zinc-600"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 whitespace-nowrap uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-[11px] leading-relaxed line-clamp-2",
                                                !notification.status ? "text-zinc-800 font-medium" : "text-zinc-500"
                                            )}>
                                                {notification.body}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 px-10 text-center space-y-4">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-50 text-zinc-200">
                                        <Inbox size={40} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-zinc-800">All caught up!</p>
                                        <p className="text-xs font-medium text-zinc-400 mt-1 uppercase tracking-widest">
                                            No new notifications for you
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-zinc-100 p-4">
                                <Link 
                                    href="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center rounded-2xl bg-zinc-50 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 transition-all hover:bg-zinc-100 hover:text-indigo-600 active:scale-[0.98]"
                                >
                                    View all history
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
