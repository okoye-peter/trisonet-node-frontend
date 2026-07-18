'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminNoticeModal from '@/components/dashboard/AdminNoticeModal';
import AuctionWinModal from '@/components/dashboard/AuctionWinModal';

export default function RootDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <DashboardLayout>{children}</DashboardLayout>
            <AdminNoticeModal />
            <AuctionWinModal />
        </AuthGuard>
    );
}
