'use client';

import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from '@/store/api/notificationApi';
import { motion } from 'framer-motion';
import { Bell, Clock, Inbox, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingScreen from '@/components/LoadingScreen';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const { data: response, isLoading, refetch } = useGetNotificationsQuery({ limit: 50 });
    const [markAllRead] = useMarkAllNotificationsReadMutation();
    const [markRead] = useMarkNotificationReadMutation();
    const router = useRouter();

    const notifications = response?.data?.notifications || [];
    const unreadCount = response?.data?.unreadCount || 0;

    const handleMarkAllRead = async () => {
        try {
            await markAllRead().unwrap();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = async (id: string) => {
        try {
            await markRead(id).unwrap();
            router.push(`/notifications/${id}`);
        } catch (err) {
            router.push(`/notifications/${id}`);
        }
    };

    if (isLoading) return <LoadingScreen message="Loading your notifications..." />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            {/* Header section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between px-2">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <div className="h-1 w-8 bg-indigo-600/20 rounded-full" />
                        Alert Center
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 lg:text-5xl">
                        Notification <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">History</span>
                    </h1>
                    <p className="mt-2 text-zinc-500 font-medium max-w-md">
                        Stay updated with your latest account activities and marketplace alerts.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <Button 
                            onClick={handleMarkAllRead}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="grid gap-6">
                {notifications.length > 0 ? (
                    <Card className="border-none bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-zinc-100">
                        <CardContent className="p-0">
                            {notifications.map((notification, index) => (
                                <div 
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.id)}
                                    className={cn(
                                        "group relative flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-8 transition-all hover:bg-zinc-50/80 cursor-pointer border-b border-zinc-50 last:border-0",
                                        !notification.status && "bg-indigo-50/10"
                                    )}
                                >
                                    {/* Unread Indicator Pill */}
                                    {!notification.status && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-1.5 rounded-r-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
                                    )}

                                    {/* Icon */}
                                    <div className={cn(
                                        "flex h-16 w-16 shrink-0 items-center justify-center rounded-[2rem] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                                        !notification.status ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-zinc-100 text-zinc-400"
                                    )}>
                                        <Bell size={28} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className={cn(
                                                    "text-xl font-black tracking-tight",
                                                    !notification.status ? "text-zinc-900" : "text-zinc-600"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                                        <Clock size={12} />
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {!notification.status && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:text-indigo-600 group-hover:bg-white group-hover:shadow-lg">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                        <p className={cn(
                                            "text-base leading-relaxed max-w-2xl",
                                            !notification.status ? "text-zinc-800 font-medium" : "text-zinc-500"
                                        )}>
                                            {notification.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 px-10 text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-zinc-200 shadow-inner">
                        <div className="flex h-32 w-32 items-center justify-center rounded-[3.5rem] bg-zinc-50 text-zinc-200">
                            <Inbox size={64} strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-zinc-800 tracking-tight">Your inbox is clear!</h3>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">
                                We'll notify you when something happens.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
