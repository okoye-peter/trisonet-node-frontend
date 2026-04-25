'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { Database } from 'lucide-react';

interface PIMCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    capitalAssetValue: number;
}

export default function PIMCardModal({ isOpen, onClose, user, capitalAssetValue }: PIMCardModalProps) {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none bg-white p-0 overflow-hidden shadow-2xl">
                {/* Header with Gradient */}
                <div className="relative h-32 bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-indigo-400 rounded-full blur-3xl" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30 shadow-xl mb-2">
                            <Database className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-white font-black tracking-tight text-lg">Partners Identification</h2>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* PIM ID Section */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl blur-sm opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                        <div className="relative bg-zinc-50 border border-zinc-100 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Partner ID</p>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{user.pimId ?? 'N/A'}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center">
                                <Database className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-5 text-center">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Capital Asset</p>
                            <h4 className="text-4xl font-black text-indigo-600 tracking-tighter">{capitalAssetValue}</h4>
                            <p className="text-[10px] font-bold text-indigo-300 mt-1">TOTAL UNITS</p>
                        </div>
                        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-5 text-center">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Status</p>
                            <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-600/10">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Verified
                                </span>
                                <p className="text-[10px] font-bold text-emerald-300 mt-1 uppercase">Level 1</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-zinc-200 to-zinc-100 flex items-center justify-center font-black text-zinc-600 text-lg">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-black text-zinc-900 leading-none">{user.name}</p>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1.5">@{user.username}</p>
                            </div>
                            {user.isUnitLeader && (
                                <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest shadow-xs">
                                    Unit Leader
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest leading-relaxed px-4">
                        This identification confirms your active participation and asset ownership within the TrisoNet ecosystem.
                    </p>

                    <div className="pt-2">
                        <button 
                            onClick={onClose}
                            className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
