'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link2, Loader2, ShieldCheck, ArrowRightLeft, Unlink, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppSelector } from '@/store/hooks';
import {
    useGetLinkedAccountsQuery,
    useRequestAccountLinkMutation,
    useVerifyAccountLinkMutation,
    useUnlinkAccountMutation,
    type LinkedAccount,
    type LinkRequestResult,
} from '@/store/api/linkedAccountApi';
import { useSwitchAccount } from '@/hooks/useSwitchAccount';
import { LINKABLE_ROLES } from '@/types';

const errorMessage = (error: unknown, fallback: string) =>
    (error as { data?: { message?: string } })?.data?.message || fallback;

const initialsOf = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

function LinkAccountForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [pending, setPending] = useState<LinkRequestResult | null>(null);

    const [requestLink, { isLoading: isRequesting }] = useRequestAccountLinkMutation();
    const [verifyLink, { isLoading: isVerifying }] = useVerifyAccountLinkMutation();

    const reset = () => {
        setIdentifier('');
        setPassword('');
        setOtp('');
        setPending(null);
    };

    const handleRequest = async () => {
        if (!identifier.trim()) {
            toast.error('Enter the username or email of the account you want to link.');
            return;
        }
        try {
            const res = await requestLink({ identifier: identifier.trim(), password: password || undefined }).unwrap();
            setPassword('');
            setPending(res.data ?? null);
            toast.success(res.message);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not verify that account'));
        }
    };

    const handleVerify = async () => {
        try {
            await verifyLink({ otp }).unwrap();
            toast.success(`${pending?.account.name ?? 'Account'} is now linked. You can switch to it from the top menu.`);
            reset();
        } catch (error) {
            const message = errorMessage(error, 'Verification failed');
            toast.error(message);
            // The pending code is gone server-side after expiry or too many attempts.
            if (/start again/i.test(message)) reset();
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!pending ? (
                <motion.div key="credentials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                        Enter the login details of your other account (sponsor, influencer, adult customer or patron).
                        We&apos;ll then send a verification code to that account&apos;s phone and email to confirm you own it.
                        For a sponsor account, just enter the sponsor email and leave the password empty.
                    </p>
                    <div className="space-y-2.5">
                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Username or Email</Label>
                        <Input
                            className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                            value={identifier}
                            autoComplete="off"
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Password of that account <span className="normal-case tracking-normal font-medium">(not needed for sponsors)</span></Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                className="h-14 px-6 pr-12 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                                value={password}
                                autoComplete="new-password"
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRequest()}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <Button
                        className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 w-full sm:w-auto"
                        onClick={handleRequest}
                        disabled={isRequesting}
                    >
                        {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Link2 className="mr-2 h-4 w-4" /> Continue</>}
                    </Button>
                </motion.div>
            ) : (
                <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-zinc-900">Verify you own {pending.account.name}</h4>
                            <p className="text-xs text-zinc-500 font-medium">
                                Enter the 6-digit code sent to {pending.destination}. It expires in 10 minutes.
                            </p>
                        </div>
                    </div>
                    <Input
                        className="h-16 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-black text-2xl tracking-[0.5em] text-zinc-900 placeholder:tracking-normal placeholder:text-zinc-300 placeholder:font-medium placeholder:text-sm"
                        placeholder="000000"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerify()}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs"
                            onClick={handleVerify}
                            disabled={isVerifying || otp.length < 6}
                        >
                            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Link Account'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs text-zinc-400 hover:text-zinc-600"
                            onClick={reset}
                        >
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function AccountRow({ account, onUnlink }: { account: LinkedAccount; onUnlink: (a: LinkedAccount) => void }) {
    const { switchTo, switchingTo } = useSwitchAccount();
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-sm font-black text-white">
                    {initialsOf(account.name)}
                </div>
                <div className="min-w-0">
                    <p className="truncate font-bold text-zinc-900">
                        {account.name}
                        {account.isCurrent && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">Current</span>}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{account.roleLabel}{account.username ? ` · @${account.username}` : ''}</p>
                </div>
            </div>
            <div className="flex gap-2">
                {!account.isCurrent && (
                    <Button
                        size="sm"
                        className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                        onClick={() => switchTo(account.id)}
                        disabled={!!switchingTo}
                    >
                        {switchingTo === account.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRightLeft className="mr-1.5 h-4 w-4" /> Switch</>}
                    </Button>
                )}
                <Button size="sm" variant="ghost" className="rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold" onClick={() => onUnlink(account)}>
                    <Unlink className="mr-1.5 h-4 w-4" /> {account.isCurrent ? 'Leave' : 'Unlink'}
                </Button>
            </div>
        </div>
    );
}

export default function LinkedAccountsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const canLink = !!user && LINKABLE_ROLES.includes(user.role) && !user.isInfant;
    const { data, isLoading } = useGetLinkedAccountsQuery(undefined, { skip: !canLink });
    const [unlinkAccount, { isLoading: isUnlinking }] = useUnlinkAccountMutation();
    const [toUnlink, setToUnlink] = useState<LinkedAccount | null>(null);
    const accounts = data?.data ?? [];

    const confirmUnlink = async () => {
        if (!toUnlink) return;
        try {
            await unlinkAccount(toUnlink.id).unwrap();
            toast.success(toUnlink.isCurrent ? 'This account has been removed from the group.' : `${toUnlink.name} has been unlinked.`);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not unlink account'));
        } finally {
            setToUnlink(null);
        }
    };

    if (user && !canLink) {
        return (
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Linked Accounts</h1>
                <p className="text-zinc-500 font-medium">Account switching isn&apos;t available for this account type.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Linked Accounts</h1>
                <p className="text-zinc-500 font-medium">Link your other TrisoNet accounts and switch between them without logging out.</p>
            </div>

            <div className="max-w-3xl space-y-6">
                <Card className="border-none bg-white shadow-sm rounded-[2rem] overflow-hidden">
                    <CardContent className="p-6 sm:p-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Users size={20} /></div>
                            <h2 className="text-lg font-black text-zinc-900">Your accounts</h2>
                        </div>
                        {isLoading ? (
                            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
                        ) : accounts.length === 0 ? (
                            <p className="text-sm text-zinc-500">No linked accounts yet. Link one below.</p>
                        ) : (
                            <div className="space-y-3">
                                {accounts.map((a) => <AccountRow key={a.id} account={a} onUnlink={setToUnlink} />)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none bg-white shadow-sm rounded-[2rem] overflow-hidden">
                    <CardContent className="p-6 sm:p-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Link2 size={20} /></div>
                            <h2 className="text-lg font-black text-zinc-900">Link another account</h2>
                        </div>
                        <LinkAccountForm />
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={!!toUnlink} onOpenChange={(open) => !open && setToUnlink(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{toUnlink?.isCurrent ? 'Leave linked accounts?' : `Unlink ${toUnlink?.name}?`}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {toUnlink?.isCurrent
                                ? 'You will no longer be able to switch from this account to your other accounts. You can link them again later with verification.'
                                : 'You will no longer be able to switch to this account without logging in. You can link it again later with verification.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUnlinking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUnlink} disabled={isUnlinking} className="bg-rose-600 hover:bg-rose-700">
                            {isUnlinking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlink'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
