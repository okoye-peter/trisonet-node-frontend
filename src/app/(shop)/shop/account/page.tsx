'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/features/authSlice';
import { useGetUserDashboardStatsQuery } from '@/store/api/userApi';
import {
    useGetStoreGuestUpgradeRequestQuery,
    useRequestStoreGuestUpgradeMutation,
} from '@/store/api/storeGuestApi';
import BuyPimModal from '@/components/dashboard/modals/BuyPimModal';

function useCountdown(deadlineAt: string | null | undefined) {
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (!deadlineAt) return;

        const tick = () => {
            const diff = new Date(deadlineAt).getTime() - Date.now();
            if (diff <= 0) {
                setLabel('Expired');
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setLabel(`${hours}h ${minutes}m remaining`);
        };

        tick();
        const interval = setInterval(tick, 60_000);
        return () => clearInterval(interval);
    }, [deadlineAt]);

    return label;
}

export default function StoreGuestAccountPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [isBuyPimModalOpen, setIsBuyPimModalOpen] = useState(false);

    const { data: upgradeResponse, isLoading: upgradeLoading } = useGetStoreGuestUpgradeRequestQuery();
    const [requestUpgrade, { isLoading: requesting }] = useRequestStoreGuestUpgradeMutation();
    const { data: statsResponse } = useGetUserDashboardStatsQuery();

    const upgradeRequest = upgradeResponse?.data ?? null;
    const countdown = useCountdown(upgradeRequest?.status === 'pending' ? upgradeRequest.deadlineAt : null);

    function handleLogout() {
        dispatch(logout());
        router.replace('/login');
    }

    async function handleRequestUpgrade() {
        try {
            await requestUpgrade().unwrap();
            toast.success('Upgrade started — complete your activation payment before the deadline.');
        } catch (error) {
            const err = error as { data?: { message?: string } };
            toast.error(err.data?.message || 'Failed to start upgrade. Please try again.');
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">My Account</h1>

            <div className="mb-6 rounded-xl border border-border p-4">
                <h2 className="mb-3 font-semibold">Profile</h2>
                <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {user?.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {user?.phone}</p>
                </div>
                <Button variant="outline" className="mt-4" onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" /> Log out
                </Button>
            </div>

            <div className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <h2 className="font-semibold">Upgrade to a full account</h2>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                    Unlock wallet funding, referrals, and every other Trisonet feature by activating a full account.
                </p>

                {upgradeLoading ? (
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                ) : upgradeRequest?.status === 'pending' ? (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-amber-600">{countdown}</p>
                        <p className="text-xs text-muted-foreground">
                            Complete your activation payment before this window closes, or your account will be
                            permanently deactivated.
                        </p>
                        <Button onClick={() => setIsBuyPimModalOpen(true)}>Complete activation payment</Button>
                    </div>
                ) : (
                    <Button onClick={handleRequestUpgrade} disabled={requesting}>
                        {requesting && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Start upgrade
                    </Button>
                )}
            </div>

            <BuyPimModal
                isOpen={isBuyPimModalOpen}
                onClose={() => setIsBuyPimModalOpen(false)}
                activationData={statsResponse?.data?.activation}
            />
        </div>
    );
}
