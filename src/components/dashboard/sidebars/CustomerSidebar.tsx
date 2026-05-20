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
    MessageSquare,
    Film,
    Newspaper
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useGetNotificationsQuery } from '@/store/api/notificationApi';
import { BaseSidebar } from './BaseSidebar';
import { SidebarItem, SidebarProps } from './types';


export function CustomerSidebar({ isOpen, onClose }: SidebarProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { data: notificationResponse } = useGetNotificationsQuery({ limit: 0 });
    const unreadCount = notificationResponse?.data?.unreadCount || 0;

    const isKycVerified = user?.level === 1 || user?.hasVerifiedLevel2 !== false;

    const sidebarItems: SidebarItem[] = useMemo(() => {
        const financeSubItems = [
            { label: 'Transfers', href: '/wallets/transfers', icon: ArrowRightLeft },
            { label: 'Transactions', href: '/transactions', icon: ScrollText },
            { label: 'Earnings', href: '/earnings', icon: TrendingUp },
            { label: 'Utility Bills', href: '/vtu', icon: Receipt },
            { label: 'Wallet', href: '/wallets', icon: Wallet },
            { label: 'Gkwth Business', href: '/wallets/gkwth', icon: Briefcase },
            { label: 'Upfront Sales', href: '/wallets/loans', icon: TrendingUp },
        ].filter(sub => {
            if (user?.level === 1) {
                return !['Earnings', 'Upfront Sales'].includes(sub.label);
            }
            return true;
        });

        return [
            { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
            // { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadCount },
            { icon: User, label: 'Profile', href: '/profile' },
            { icon: MessageSquare, label: 'Talkzone', href: '/talkzone' },
            { icon: Newspaper, label: 'Gists Zone', href: '/gists-zone' },
            { icon: Film, label: 'Reels', href: '/dashboard/reels' },
            { icon: Trophy, label: 'Winning Range', href: '/competitions/stats' },
            { icon: CreditCard, label: 'PIM Credit Cards', href: '/activation-cards' },
            { icon: Users, label: 'Wards', href: '/wards' },
            { icon: CircleDollarSign, label: 'Wards Fees', href: '/wards/fees' },
            {
                icon: PieChart,
                label: 'Finance',
                href: '/dashboard/finance',
                hasSubmenu: true,
                subItems: financeSubItems
            },
            { icon: CheckCircle2, label: 'Winning Status', href: '/winnings/status' },
        ];
    }, [user?.level]);

    return (
        <BaseSidebar
            isOpen={isOpen}
            onClose={onClose}
            items={sidebarItems}
            isKycVerified={isKycVerified}
        />
    );
}
