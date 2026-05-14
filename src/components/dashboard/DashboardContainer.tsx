'use client';

import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { DashboardStats } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import QRCodeModal from '@/components/dashboard/QRCodeModal';
import WelcomeVideo from '@/components/dashboard/WelcomeVideo';
import PIMCardModal from '@/components/dashboard/PIMCardModal';
import { useGetNotificationsQuery } from '@/store/api/notificationApi';
import { useGetGkwthPricesQuery } from '@/store/api/walletApi';
import Level1Dashboard from '@/components/dashboard/Level1Dashboard';
import Level2Dashboard from '@/components/dashboard/Level2Dashboard';
import BuyPimModal from '@/components/dashboard/modals/BuyPimModal';
import EmailVerificationModal from '@/components/dashboard/modals/EmailVerificationModal';
import { ROLES } from '@/types';

interface DashboardContainerProps {
    forcedLevel?: number;
}

export default function DashboardContainer({ forcedLevel }: DashboardContainerProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [showWelcome, setShowWelcome] = useState(false);
    const [welcomeReady, setWelcomeReady] = useState(false);

    const [qrCodeConfig, setQrCodeConfig] = useState<{ isOpen: boolean; url: string; title: string }>({
        isOpen: false,
        url: '',
        title: ''
    });

    const [isPimCardModalOpen, setIsPimCardModalOpen] = useState(false);
    const [isBuyPimModalOpen, setIsBuyPimModalOpen] = useState(false);
    const [isEmailVerifyModalOpen, setIsEmailVerifyModalOpen] = useState(false);

    const { data: notificationResponse } = useGetNotificationsQuery({ limit: 5 });
    const unreadCount = notificationResponse?.data?.unreadCount || 0;
    const latestNotifications = notificationResponse?.data?.notifications || [];

    useEffect(() => {
        const hasSeen = sessionStorage.getItem('hasSeenWelcome');
        const timer = setTimeout(() => {
            if (!hasSeen) {
                setShowWelcome(true);
            }
            setWelcomeReady(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const { data: dashboardStatsResponse, isLoading: dashboardStatsIsLoading } = useQuery<{ data: DashboardStats }>({
        queryKey: ['userDashboardStats', user?.id],
        queryFn: async () => {
            const res = await api.get('/users/dashboard-stats');
            return res.data;
        }
    });

    const dashboardStats = dashboardStatsResponse?.data;
    const { data: pricesResponse } = useGetGkwthPricesQuery();
    const gkwthPurchasePrice = Number(pricesResponse?.data?.gkwthPurchasePrice) || 0;

    if (!welcomeReady) return <LoadingScreen />;

    if (showWelcome) {
        return <WelcomeVideo onEnded={() => {
            sessionStorage.setItem('hasSeenWelcome', 'true');
            setShowWelcome(false);
            window.dispatchEvent(new Event('welcomeVideoEnded'));
        }} />;
    }

    if (dashboardStatsIsLoading) return <LoadingScreen />;

    const dashboardProps = {
        user,
        dashboardStats,
        unreadCount,
        latestNotifications,
        gkwthPurchasePrice,
        setIsPimModalOpen: setIsBuyPimModalOpen,
        setIsPimCardModalOpen,
    };

    const displayLevel = forcedLevel || user?.level || 1;

    return (
        <>
            {user?.role === ROLES.CUSTOMER && displayLevel === 2 ? (
                <Level2Dashboard {...dashboardProps} />
            ) : (
                <Level1Dashboard
                    {...dashboardProps}
                    setQrCodeConfig={setQrCodeConfig}
                    setIsEmailVerifyModalOpen={setIsEmailVerifyModalOpen}
                />
            )}

            <PIMCardModal 
                isOpen={isPimCardModalOpen} 
                onClose={() => setIsPimCardModalOpen(false)} 
                user={user} 
                capitalAssetValue={dashboardStats?.wallets?.find(w => w.type === 'indirect')?.amount ?? 0}
            />

            <QRCodeModal
                isOpen={qrCodeConfig.isOpen}
                onClose={() => setQrCodeConfig({ ...qrCodeConfig, isOpen: false })}
                url={qrCodeConfig.url}
                title={qrCodeConfig.title}
            />

            <BuyPimModal
                isOpen={isBuyPimModalOpen}
                onClose={() => setIsBuyPimModalOpen(false)}
                activationData={dashboardStats?.activation}
            />

            <EmailVerificationModal
                isOpen={isEmailVerifyModalOpen}
                onClose={() => setIsEmailVerifyModalOpen(false)}
                currentEmail={user?.email || ''}
            />
        </>
    );
}
