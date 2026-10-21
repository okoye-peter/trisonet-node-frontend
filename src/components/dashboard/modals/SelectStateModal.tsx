'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/lib/axios';
import { useSelectStateMutation } from '@/store/api/userApi';

interface SelectStateModalProps {
    isOpen: boolean;
    onClose: () => void;
    country?: string | null;
}

// Existing accounts without a state pick one here, once. After saving it is read-only for the user.
export default function SelectStateModal({ isOpen, onClose, country }: SelectStateModalProps) {
    const [stateId, setStateId] = useState('');
    const queryClient = useQueryClient();
    const [selectState, { isLoading: isSaving }] = useSelectStateMutation();

    const { data: states = [], isLoading: statesLoading } = useQuery<{ id: string; name: string }[]>({
        queryKey: ['states', country],
        queryFn: async () => {
            const res = await api.get('/regions/states', { params: { country } });
            return res.data?.data || [];
        },
        enabled: isOpen && !!country,
    });

    const handleSave = async () => {
        if (!stateId) {
            toast.error('Please select your state');
            return;
        }
        try {
            await selectState({ state_id: stateId }).unwrap();
            toast.success('State saved');
            queryClient.invalidateQueries({ queryKey: ['stateMigration'] });
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to save state');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="relative w-full max-w-md bg-white shadow-2xl rounded-3xl"
                    >
                        <div className="relative p-6 overflow-hidden rounded-t-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600">
                            <div className="absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 rounded-full bg-white/10 blur-2xl" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex items-center justify-center border w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border-white/30">
                                    <MapPin size={22} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{country}</p>
                                    <h2 className="text-2xl font-black leading-tight text-white">Select Your State</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Pick the state you belong to so you can follow its weekly target.
                                You can only set this once - contact support if you need it changed later.
                            </p>

                            <SearchableSelect
                                placeholder={statesLoading ? 'Loading states...' : 'Select State'}
                                value={stateId}
                                onValueChange={setStateId}
                                isLoading={statesLoading}
                                triggerClassName="h-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm"
                                items={states.map((s) => ({ label: s.name, value: s.id.toString() }))}
                            />

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
                                    disabled={isSaving || !stateId}
                                    className="flex-1 h-12 text-xs font-black tracking-wider text-white uppercase rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save State'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
