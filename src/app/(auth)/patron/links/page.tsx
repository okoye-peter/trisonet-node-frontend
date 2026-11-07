'use client';

import { useMemo, useState } from 'react';
import { Link2, Copy, Search, Users, Wallet, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';
import { useGetPatronAdminLinksQuery, type PatronAdminLinkRow } from '@/store/api/patronApi';
import { formatNaira } from '@/lib/shopUtils';

/**
 * Admin member account only: one registration link per patron leader/organization.
 * Available slots = how many more customers the patron's patronage balance can pay for.
 */
export default function PatronLinksPage() {
    const { data, isLoading, error } = useGetPatronAdminLinksQuery();
    const [search, setSearch] = useState('');
    const [onlyWithSlots, setOnlyWithSlots] = useState(false);

    const report = data?.data;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const linkUrl = (row: PatronAdminLinkRow) => `${origin}/register?ref=${row.code}`;

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase();
        return (report?.links ?? [])
            .filter(r => !onlyWithSlots || (r.active && r.availableSlots > 0))
            .filter(r => !term
                || r.name.toLowerCase().includes(term)
                || r.patron?.name.toLowerCase().includes(term)
                || r.patron?.email.toLowerCase().includes(term));
    }, [report, search, onlyWithSlots]);

    const copy = async (row: PatronAdminLinkRow) => {
        try {
            await navigator.clipboard.writeText(linkUrl(row));
            toast.success(`Link for ${row.name} copied`);
        } catch {
            toast.error('Could not copy the link');
        }
    };

    if (isLoading) return <LoadingScreen />;

    if (error || !report) {
        return (
            <Card className="rounded-3xl border border-zinc-100 p-8 text-zinc-500">
                Patron links are only available to the admin member account.
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-3 px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                    <Link2 size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Admin member</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900">Patron Links</h1>
                <p className="text-zinc-400 font-medium text-sm max-w-2xl">
                    Share a patron&apos;s link to register customers under them. Each registration is paid from that
                    patron&apos;s patronage wallet ({formatNaira(report.activationFee)} per customer) and earns you the member commission.
                    Each round you can use half of a patron&apos;s slots; the link reopens once the patron&apos;s own members use the other half.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Stat icon={Ticket} label="Available slots" value={report.totals.availableSlots.toLocaleString()} />
                <Stat icon={Users} label="Customers registered" value={report.totals.registered.toLocaleString()} />
                <Stat icon={Wallet} label="Commission earned" value={formatNaira(report.totals.earned)} />
            </div>

            <Card className="rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-6 border-b border-zinc-50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search patron or organization..."
                                className="h-12 rounded-xl bg-zinc-50 border-none pl-12 font-bold"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 cursor-pointer">
                            <input type="checkbox" checked={onlyWithSlots} onChange={e => setOnlyWithSlots(e.target.checked)} />
                            Only links with available slots
                        </label>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-[10px] uppercase tracking-widest text-zinc-400 text-left">
                                <tr>
                                    <th className="p-4">Patron / Organization</th>
                                    <th className="p-4">Patronage balance</th>
                                    <th className="p-4">Available slots</th>
                                    <th className="p-4">Registered</th>
                                    <th className="p-4">Earned</th>
                                    <th className="p-4">Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr><td colSpan={6} className="p-8 text-center text-zinc-400">No links match.</td></tr>
                                )}
                                {rows.map(row => (
                                    <tr key={row.id} className="border-t border-zinc-50">
                                        <td className="p-4">
                                            <p className="font-black text-zinc-900">{row.name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                {row.type === 'group' ? `Organization · paid by ${row.patron?.name ?? '-'}` : row.patron?.email}
                                            </p>
                                        </td>
                                        <td className="p-4 font-bold text-zinc-700">{formatNaira(row.patronageBalance)}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black ${row.availableSlots > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {row.availableSlots.toLocaleString()}
                                            </span>
                                            {row.round.roundSlots !== null && (
                                                <p className="mt-1 text-[10px] font-bold text-zinc-400">
                                                    Round: {row.round.adminUsed}/{row.round.adminQuota} used of {row.round.roundSlots}
                                                </p>
                                            )}
                                            {row.round.status === 'waiting_for_members' && (
                                                <p className="mt-1 text-[10px] font-bold text-amber-600">
                                                    Locked until the patron&apos;s members register {row.round.membersRemaining} more
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold">{row.registered}</td>
                                        <td className="p-4 font-bold">{formatNaira(row.earned)}</td>
                                        <td className="p-4">
                                            {row.active ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={row.availableSlots === 0}
                                                    onClick={() => copy(row)}
                                                    className="rounded-xl font-bold text-xs"
                                                    title={row.availableSlots > 0
                                                        ? linkUrl(row)
                                                        : row.round.status === 'waiting_for_members'
                                                            ? `You've used your half for this round. Reopens after the patron's members register ${row.round.membersRemaining} more`
                                                            : 'No slots: the patron needs to fund their patronage wallet'}
                                                >
                                                    <Copy size={14} className="mr-2" /> Copy link
                                                </Button>
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-400">Disabled by admin</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
    return (
        <Card className="rounded-3xl p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Icon size={14} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
            </div>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">{value}</h3>
        </Card>
    );
}
