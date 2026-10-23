'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Loader2, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateProfileMutation } from '@/store/api/userApi';

const noopSubscribe = () => () => {};

interface NextOfKinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Asks existing accounts without a next of kin to add one. It can be changed later from the profile.
export default function NextOfKinModal({ isOpen, onClose }: NextOfKinModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

    const handleSave = async () => {
        const nextOfKinName = name.trim();
        const nextOfKinPhone = phone.trim();
        // Same rules as the backend (users/update)
        if (nextOfKinName.length < 2) {
            toast.error('Next of kin name is required');
            return;
        }
        if (!/^\+?\d{10,15}$/.test(nextOfKinPhone)) {
            toast.error('Next of kin phone must be 10 to 15 digits');
            return;
        }
        try {
            await updateProfile({ next_of_kin_name: nextOfKinName, next_of_kin_phone: nextOfKinPhone }).unwrap();
            toast.success('Next of kin saved');
            onClose();
        } catch (err) {
            toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to save next of kin');
        }
    };

    // Portal to body (client only - document doesn't exist during SSR): the dashboard wraps modals in a transformed motion.div, which would
    // otherwise make `fixed` resolve against that wrapper instead of the viewport.
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="relative w-full max-w-md bg-white shadow-2xl rounded-3xl"
                    >
                        <div className="relative p-6 overflow-hidden rounded-t-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600">
                            <div className="absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 rounded-full bg-white/10 blur-2xl" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex items-center justify-center border w-11 h-11 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm border-white/30">
                                    <HeartHandshake size={22} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Profile</p>
                                    <h2 className="text-xl font-black leading-tight text-white sm:text-2xl">Add Your Next of Kin</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Tell us who we should contact on your behalf. You can change this any time from your profile.
                            </p>

                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                <Input
                                    className="h-12 pl-11 text-sm font-bold bg-zinc-50 border border-zinc-200 rounded-2xl"
                                    placeholder="Next of kin full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                <Input
                                    className="h-12 pl-11 text-sm font-bold bg-zinc-50 border border-zinc-200 rounded-2xl"
                                    placeholder="+2348000000000"
                                    inputMode="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="flex-1 h-12 text-xs font-black tracking-wider uppercase rounded-2xl"
                                >
                                    Later
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !name.trim() || !phone.trim()}
                                    className="flex-1 h-12 text-xs font-black tracking-wider text-white uppercase rounded-2xl bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
