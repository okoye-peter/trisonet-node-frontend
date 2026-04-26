'use client';

import { useMemo } from 'react';
import {
    Bell,
    Users,
    UserPlus,
    Wallet,
    LayoutGrid,
    Building2
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useGetNotificationsQuery } from '@/store/api/notificationApi';
import { BaseSidebar } from './BaseSidebar';
import { SidebarItem, SidebarProps } from './types';

export function PatronSidebar({ isOpen, onClose }: SidebarProps) {
    const { data: notificationResponse } = useGetNotificationsQuery({ limit: 0 });
    const unreadCount = notificationResponse?.data?.unreadCount || 0;

    const sidebarItems: SidebarItem[] = useMemo(() => [
        { icon: LayoutGrid, label: 'Dashboard', href: '/patron/dashboard' },
        { icon: Users, label: 'Members', href: '/patron/members' },
        { icon: Building2, label: 'Organization', href: '/patron/organization' },
        { icon: UserPlus, label: 'Beneficiaries', href: '/patron/beneficiaries' },
        { icon: Wallet, label: 'Wallet', href: '/patron/wallet' },
        { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadCount },
    ], [unreadCount]);

    return (
        <BaseSidebar
            isOpen={isOpen}
            onClose={onClose}
            items={sidebarItems}
            isKycVerified={true} // Patrons bypass KYC restrictions
        />
    );
}
