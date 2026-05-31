'use client';

import { useEffect, useState } from 'react';
import { BellIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useGetAdminNoticesQuery } from '@/store/api/adminNoticeApi';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function AdminNoticeModal() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const { data, refetch } = useGetAdminNoticesQuery(undefined, {
        skip: !isAuthenticated,
    });

    const notices = data?.data?.notices ?? [];
    const current = notices[index];
    const isLast = index === notices.length - 1;

    // Open as soon as notices load for the first time
    useEffect(() => {
        if (notices.length > 0) {
            setIndex(0);
            setOpen(true);
        }
    }, [notices.length]);

    // Re-open every 5 minutes
    useEffect(() => {
        if (!isAuthenticated) return;

        const id = setInterval(() => {
            refetch();
            setIndex(0);
            setOpen(true);
        }, FIVE_MINUTES);

        return () => clearInterval(id);
    }, [isAuthenticated, refetch]);

    const handleNext = () => setIndex((i) => i + 1);
    const handleDismiss = () => setOpen(false);

    if (!isAuthenticated || !current) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-primary/10">
                            <BellIcon className="w-4 h-4 text-primary" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-base font-semibold leading-tight">
                                {current.title}
                            </DialogTitle>
                            {notices.length > 1 && (
                                <span className="text-xs text-muted-foreground">
                                    {index + 1} of {notices.length}
                                </span>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap px-1">
                    {current.body}
                </p>

                <DialogFooter>
                    {!isLast ? (
                        <Button onClick={handleNext} className="w-full sm:w-auto">
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleDismiss} className="w-full sm:w-auto">
                            Got it
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
