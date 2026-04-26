'use client';

import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/types';
import { CustomerSidebar } from './sidebars/CustomerSidebar';
import { PatronSidebar } from './sidebars/PatronSidebar';
import { SidebarProps } from './sidebars/types';

export function Sidebar(props: SidebarProps) {
    const { user } = useAppSelector((state) => state.auth);

    if (user?.role === ROLES.PATRON) {
        return <PatronSidebar {...props} />;
    }

    // Default to Customer Sidebar for now, can add more roles later
    return <CustomerSidebar {...props} />;
}
