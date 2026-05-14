'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User } from '@/types';
import Image from 'next/image';

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
            <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-3xl shadow-xl border-none">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-semibold text-zinc-900 tracking-tight pr-6">
                        Partners Identification Module
                    </DialogTitle>
                </DialogHeader>

                <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-sm">
                    <Image 
                        src="/trisonet-2.jpg" 
                        alt="PIM Card Background" 
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                    
                    {/* Overlays */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                        <div className="flex justify-between items-end w-full">
                            <p className="text-black font-medium text-sm tracking-wide">
                                Capital Asset: {capitalAssetValue}
                            </p>
                            <p className="text-black font-semibold text-base tracking-wide">
                                {user.pimId?.startsWith('PIM') ? user.pimId : `PIM/${user.pimId || 'N/A'}`}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
