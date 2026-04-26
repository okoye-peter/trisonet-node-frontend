'use client';

import { useMemo } from 'react';
import {
    LayoutGrid,
    Trophy,
    User,
    CreditCard,
    Users,
    CircleDollarSign,
    PieChart,
    CheckCircle2,
    ArrowRightLeft,
    ScrollText,
    Receipt,
    Wallet,
    Briefcase,
    TrendingUp,
    Bell
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useGetNotificationsQuery } from '@/store/api/notificationApi';
import { BaseSidebar } from './BaseSidebar';
import { SidebarItem, SidebarProps } from './types';
import { ROLES } from '@/types';

export function CustomerSidebar({ isOpen, onClose }: SidebarProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { data: notificationResponse } = useGetNotificationsQuery({ limit: 0 });
    const unreadCount = notificationResponse?.data?.unreadCount || 0;

    const isKycVerified = user?.hasVerifiedLevel2 !== false;

    const sidebarItems: SidebarItem[] = useMemo(() => [
        { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
        { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadCount },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: Trophy, label: 'Winning Range', href: '/competitions/stats' },
        { icon: CreditCard, label: 'PIM Credit Cards', href: '/activation-cards' },
        { icon: Users, label: 'Wards', href: '/wards' },
        { icon: CircleDollarSign, label: 'Wards Fees', href: '/wards/fees' },
        {
            icon: PieChart,
            label: 'Finance',
            href: '/dashboard/finance',
            hasSubmenu: true,
            subItems: [
                { label: 'Transfers', href: '/wallets/transfers', icon: ArrowRightLeft },
                { label: 'Transactions', href: '/transactions', icon: ScrollText },
                { label: 'Earnings', href: '/earnings', icon: TrendingUp },
                { label: 'Utility Bills', href: '/vtu', icon: Receipt },
                { label: 'Wallet', href: '/wallets', icon: Wallet },
                { label: 'Gkwth Business', href: '/wallets/gkwth', icon: Briefcase },
                { label: 'Upfront Sales', href: '/wallets/loans', icon: TrendingUp },
            ]
        },
        { icon: CheckCircle2, label: 'Winning Status', href: '/winnings/status' },
    ], [unreadCount]);

    return (
        <BaseSidebar
            isOpen={isOpen}
            onClose={onClose}
            items={sidebarItems}
            isKycVerified={isKycVerified}
        />
    );
}
