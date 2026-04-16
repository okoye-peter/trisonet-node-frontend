'use client';

import { useGetNotificationQuery, useMarkNotificationReadMutation } from '@/store/api/notificationApi';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function NotificationDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: response, isLoading, error } = useGetNotificationQuery(id as string);
    const [markRead] = useMarkNotificationReadMutation();

    const notification = response?.data;

    useEffect(() => {
        if (notification && !notification.status) {
            markRead(id as string);
        }
    }, [notification, id, markRead]);

    if (isLoading) return <LoadingScreen message="Fetching notification details..." />;
    
    if (error || !notification) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="h-24 w-24 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <Bell size={40} />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-zinc-900">Notification Not Found</h2>
                    <p className="text-zinc-500 mt-2 font-medium">The notification you're looking for might have been deleted or moved.</p>
                </div>
                <Button 
                    onClick={() => router.push('/notifications')}
                    className="h-14 px-8 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-0.98"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to notifications
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-20"
        >
            {/* Navigation Header */}
            <div className="flex items-center justify-between px-2">
                <button 
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-zinc-400 hover:text-indigo-600 transition-all font-bold uppercase tracking-[0.2em] text-[10px]"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all group-hover:-translate-x-1">
                        <ArrowLeft size={16} />
                    </div>
                    Go Back
                </button>
                
                <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                    Detail View
                    <div className="h-1 w-8 bg-indigo-600/20 rounded-full" />
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="border-none bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/20 overflow-hidden border border-zinc-100/50">
                <CardContent className="p-0">
                    {/* Visual Header */}
                    <div className="relative h-48 bg-linear-to-br from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                        </div>
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white text-indigo-600 shadow-2xl"
                        >
                            <Bell size={40} className="drop-shadow-sm" />
                        </motion.div>
                    </div>

                    <div className="p-10 lg:p-14 space-y-10">
                        {/* Title and Metadata */}
                        <div className="space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 leading-[1.1]">
                                {notification.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-100/50 shadow-sm">
                                    <Calendar size={14} className="text-indigo-600" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                                        {format(new Date(notification.createdAt), 'PPP')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-100/50 shadow-sm">
                                    <Clock size={14} className="text-indigo-600" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                                        {format(new Date(notification.createdAt), 'p')}
                                    </span>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl shadow-sm border",
                                    notification.status 
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                                        : "bg-indigo-50 text-indigo-600 border-indigo-100/50"
                                )}>
                                    <CheckCircle2 size={14} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">
                                        {notification.status ? 'Already Read' : 'Newly Read'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-linear-to-r from-transparent via-zinc-100 to-transparent" />

                        {/* Notification Body */}
                        <div className="space-y-6">
                            <div className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">Message Body</div>
                            <div className="text-xl lg:text-2xl text-zinc-700 leading-relaxed font-medium">
                                {notification.body}
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="pt-10 flex border-t border-zinc-50">
                            <Button 
                                onClick={() => router.push('/notifications')}
                                className="h-16 px-10 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-0.98"
                            >
                                Back to notifications
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
