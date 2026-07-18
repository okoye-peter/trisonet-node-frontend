'use client';

import { useParams } from 'next/navigation';
import { useGetAuctionTransactionQuery } from '@/store/api/auctionApi';
import { useGetWalletsQuery } from '@/store/api/walletApi';
import { AuctionWonSummary } from '@/components/auctions/AuctionWonSummary';
import LoadingScreen from '@/components/LoadingScreen';

export default function AuctionWonPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useGetAuctionTransactionQuery(id);
    const { data: walletsResponse } = useGetWalletsQuery();

    const transaction = data?.data;
    const gkwthWallet = (walletsResponse?.data || []).find((w) => w.type === 'indirect');

    if (isLoading) return <LoadingScreen />;
    if (!transaction) return <div className="py-16 text-center text-zinc-400">Transaction not found.</div>;

    return (
        <div className="mx-auto max-w-2xl">
            <AuctionWonSummary transaction={transaction} newGkwthBalance={gkwthWallet?.amount ?? null} />
        </div>
    );
}
