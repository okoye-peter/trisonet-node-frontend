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
import { useGetPatronDashboardQuery, useGetPatronPlansQuery } from '@/store/api/patronApi';
import { BaseSidebar } from './BaseSidebar';
import { SidebarItem, SidebarProps } from './types';
import { ROLES } from '@/types';

export function PatronSidebar({ isOpen, onClose }: SidebarProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { data: dashboardData } = useGetPatronDashboardQuery();
    const { data: notificationResponse } = useGetNotificationsQuery({ limit: 0 });
    const { data: plansResponse } = useGetPatronPlansQuery();
    const plans = plansResponse?.data || [];
    const unreadCount = notificationResponse?.data?.unreadCount || 0;

    const patronData = dashboardData?.data;
    const isGroupOwner = !user?.patronId && patronData?.patronGroup?.type === 'group';
    
    const isRestrictedGroupPatron = useMemo(() => {
        if (user?.role !== ROLES.PATRON || user?.pendingPatronType !== 'group') return false;
        if (!patronData?.patronGroup) return true;
        return !patronData.patronGroup.isFunded;
    }, [user, patronData]);

    const sidebarItems: SidebarItem[] = useMemo(() => {
        const items = [
            { icon: LayoutGrid, label: 'Dashboard', href: '/patron/dashboard' },
            { icon: Users, label: 'Members', href: '/patron/members' },
            { icon: Building2, label: 'Organization', href: '/patron/organization' },
            { icon: UserPlus, label: 'Beneficiaries', href: '/patron/beneficiaries' },
            { icon: Wallet, label: 'Wallet', href: '/patron/wallet' },
        ];

        // If a group patron hasn't created their group, restrict them to the dashboard only
        if (isRestrictedGroupPatron) {
            return items.filter(item => item.label === 'Dashboard');
        }

        // Hide Organization link if not the group owner
        return items.filter(item => {
            if (item.label === 'Organization') return isGroupOwner;
            return true;
        });
    }, [isGroupOwner, isRestrictedGroupPatron]);


    return (
        <BaseSidebar
            isOpen={isOpen}
            onClose={onClose}
            items={sidebarItems}
            isKycVerified={true} // Patrons bypass KYC restrictions
        />
    );
}
