'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { useGetMyAuctionsQuery } from '@/store/api/auctionApi';
import { AuctionPageHeader } from '@/components/auctions/AuctionPageHeader';
import { ActiveAuctionCard } from '@/components/auctions/ActiveAuctionCard';
import { PastAuctionsList } from '@/components/auctions/PastAuctionsList';
import { CreateAuctionPanel } from '@/components/auctions/CreateAuctionPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';

const TABS = ['active', 'past', 'create'] as const;
type Tab = (typeof TABS)[number];

export default function MyAuctionsPage() {
    return (
        <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
            <MyAuctionsPageContent />
        </Suspense>
    );
}

function MyAuctionsPageContent() {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data, isLoading } = useGetMyAuctionsQuery();

    const tabParam = searchParams.get('tab');
    const activeTab: Tab = (TABS as readonly string[]).includes(tabParam || '') ? (tabParam as Tab) : 'active';

    const setActiveTab = useCallback((tab: Tab) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab === 'active') params.delete('tab');
        else params.set('tab', tab);
        const qs = params.toString();
        router.replace(`/wallets/gkwth/auction/my${qs ? `?${qs}` : ''}`, { scroll: false });
    }, [router, searchParams]);

    if (isLoading) return <LoadingScreen />;

    const result = data?.data;
    const active = result?.active || [];
    const past = result?.past || [];
    const stats = result?.stats;

    return (
        <div className="space-y-8">
            <AuctionPageHeader
                eyebrow="Seller Dashboard"
                title={<>My <span className="text-indigo-600">GKWTH</span> Auctions</>}
                description="Manage your active listings and review incoming bids to accept."
                action={
                    <Button type="button" onClick={() => setActiveTab('create')} className="bg-indigo-600 text-white hover:bg-indigo-700">
                        <Plus size={14} strokeWidth={2.5} /> New Auction
                    </Button>
                }
                stats={[
                    { label: 'Active Auctions', value: stats?.activeCount ?? 0 },
                    { label: 'Total Bids Received', value: stats?.totalBidsReceived ?? 0 },
                    { label: 'Total Earned (All Time)', value: `${currency}${(stats?.totalEarnedAllTime ?? 0).toLocaleString()}` },
                ]}
            />

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
                <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6 space-y-6">
                    {active.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
                            You have no active auctions.{' '}
                            <button type="button" onClick={() => setActiveTab('create')} className="font-semibold text-indigo-600">
                                List your GKWTH →
                            </button>
                        </div>
                    ) : (
                        active.map((auction) => <ActiveAuctionCard key={auction.id} auction={auction} />)
                    )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                    {past.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
                            No past auctions yet.
                        </div>
                    ) : (
                        <PastAuctionsList auctions={past} />
                    )}
                </TabsContent>

                <TabsContent value="create" className="mt-6">
                    <CreateAuctionPanel onCreated={(id) => router.push(`/wallets/gkwth/auction/${id}`)} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
