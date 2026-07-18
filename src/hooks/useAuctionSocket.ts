import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { apiSlice } from '@/store/api/apiSlice';

const AUCTION_EVENTS = [
    'AuctionBidPlacedEvent',
    'AuctionOutbidEvent',
    'AuctionBidAcceptedEvent',
    'AuctionEndedEvent',
    'AuctionCreatedEvent',
] as const;

/** Listens for auction socket events and invalidates the 'Auction' RTK Query cache tag on any of them. */
export function useAuctionSocket() {
    const token = useAppSelector((state) => state.auth.token);
    // useAppDispatch() returns Redux's stable dispatch reference, safe to use directly inside the effect below.
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!token) return;

        const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');
        const socket = io(socketUrl, { auth: { token } });

        const handleInvalidate = () => {
            dispatch(apiSlice.util.invalidateTags(['Auction']));
        };

        AUCTION_EVENTS.forEach((event) => socket.on(event, handleInvalidate));

        return () => {
            AUCTION_EVENTS.forEach((event) => socket.off(event, handleInvalidate));
            socket.disconnect();
        };
    }, [token, dispatch]);
}
