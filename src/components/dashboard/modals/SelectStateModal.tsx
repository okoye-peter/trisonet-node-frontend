'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
    // Set when the user already has a state and is using their one self-service change
    currentState?: { id: string; name: string } | null;
}

// Accounts without a state pick one here; accounts with a state can change it here once.
export default function SelectStateModal({ isOpen, onClose, country, currentState }: SelectStateModalProps) {
    const isChange = !!currentState;
    const [stateId, setStateId] = useState('');
    const [mounted, setMounted] = useState(false);
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
            toast.success(isChange ? 'State changed' : 'State saved');
            queryClient.invalidateQueries({ queryKey: ['stateMigration'] });
            setStateId('');
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to save state');
        }
    };

    useEffect(() => setMounted(true), []);

    // Portal to body: the dashboard wraps modals in a transformed motion.div, which would
    // otherwise make `fixed` resolve against that wrapper instead of the viewport.
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
                        <div className="relative p-6 overflow-hidden rounded-t-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600">
                            <div className="absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 rounded-full bg-white/10 blur-2xl" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex items-center justify-center border w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border-white/30">
                                    <MapPin size={22} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{country}</p>
                                    <h2 className="text-xl font-black leading-tight text-white sm:text-2xl">{isChange ? 'Change Your State of Residence' : 'Select Your State of Residence'}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {isChange ? (
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    Your current state is <span className="font-bold text-zinc-900">{currentState.name}</span>.
                                    You can only change your state <span className="font-bold text-zinc-900">once</span> - after
                                    that, contact support if it needs to change again.
                                </p>
                            ) : (
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    Pick the state you belong to so you can follow its weekly target.
                                    If you pick the wrong one, you can change it once from your profile.
                                </p>
                            )}

                            <SearchableSelect
                                placeholder={statesLoading ? 'Loading states...' : 'Select State'}
                                value={stateId}
                                onValueChange={setStateId}
                                isLoading={statesLoading}
                                triggerClassName="h-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm"
                                items={states
                                    .filter((s) => s.id.toString() !== currentState?.id?.toString())
                                    .map((s) => ({ label: s.name, value: s.id.toString() }))}
                            />

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="flex-1 h-12 text-xs font-black tracking-wider uppercase rounded-2xl"
                                >
                                    {isChange ? 'Cancel' : 'Later'}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !stateId}
                                    className="flex-1 h-12 text-xs font-black tracking-wider text-white uppercase rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isChange ? 'Change State' : 'Save State'}
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
