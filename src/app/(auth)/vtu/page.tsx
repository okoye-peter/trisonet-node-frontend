'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone,
    Smartphone,
    Wifi,
    Tv,
    Lock,
    Wallet as WalletIcon,
    Loader2,
    CheckCircle2,
    ChevronRight,
    Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useGetVtuDataQuery,
    useBuyAirtimeMutation,
    useBuyDataMutation,
    useSubCableMutation
} from '@/store/api/vtuApi';
import type { Wallet, VtuDataBundle, VtuCablePackage } from '@/types';

// --- Schemas ---
const airtimeSchema = z.object({
    network: z.string().min(1, 'Please select a network'),
    phoneNo: z.string().min(10, 'Invalid phone number'),
    amount: z.string().min(1, 'Amount is required'),
    wallet: z.string().min(1, 'Please select a wallet'),
    pin: z.string().min(4, 'Transaction pin is required'),
});

const dataSchema = z.object({
    network: z.string().min(1, 'Please select a network'),
    bundle: z.string().min(1, 'Please select a bundle'),
    phoneNo: z.string().min(10, 'Invalid phone number'),
    wallet: z.string().min(1, 'Please select a wallet'),
    pin: z.string().min(4, 'Transaction pin is required'),
});

const cableSchema = z.object({
    provider: z.string().min(1, 'Please select a provider'),
    package: z.string().min(1, 'Please select a package'),
    decoderNo: z.string().min(5, 'Invalid decoder number'),
    wallet: z.string().min(1, 'Please select a wallet'),
    pin: z.string().min(4, 'Transaction pin is required'),
});

// --- Networks Constants ---
const NETWORKS = [
    { id: 'mtn', name: 'MTN', color: '#FFCC00', icon: '/networks/mtn.png' },
    { id: 'glo', name: 'Glo', color: '#009900', icon: '/networks/glo.png' },
    { id: 'airtel', name: 'Airtel', color: '#FF0000', icon: '/networks/airtel.png' },
    { id: '9mobile', name: '9Mobile', color: '#006633', icon: '/networks/9mobile.png' },
];

export default function VtuPage() {
    const [activeTab, setActiveTab] = useState<'airtime' | 'data' | 'cable'>('airtime');

    // API Hooks
    const { data: vtuData, isLoading: isDataLoading } = useGetVtuDataQuery();
    const [buyAirtime, { isLoading: isBuyingAirtime }] = useBuyAirtimeMutation();
    const [buyData, { isLoading: isBuyingData }] = useBuyDataMutation();
    const [subCable, { isLoading: isSubbingCable }] = useSubCableMutation();

    if (isDataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    const { data_bundles = {}, wallets = [], packages = {}, providers = [] } = vtuData || {};

    console.log('data_bundles', data_bundles)
    console.log('packages', packages)

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                        VTU Terminal
                    </h1>
                    <p className="text-slate-500 mt-1">Recharge airtime, buy data, and pay bills instantly.</p>
                </div>

                {wallets.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {wallets.filter(w => w.type === 'direct').map((wallet: Wallet) => (
                            <div
                                key={wallet.id}
                                className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 flex items-center gap-3 min-w-[160px]"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <WalletIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">{wallet.type.replace('_', ' ')}</p>
                                    <p className="font-bold text-slate-800">₦{wallet.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </header>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-100/50 rounded-2xl w-fit mx-auto md:mx-0 shadow-inner">
                {[
                    { id: 'airtime', name: 'Airtime', icon: Phone },
                    { id: 'data', name: 'Data Bundle', icon: Wifi },
                    { id: 'cable', name: 'Cable TV', icon: Tv },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                            ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-xl"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon className="relative z-10 w-4 h-4" />
                        <span className="relative z-10">{tab.name}</span>
                    </button>
                ))}
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-none shadow-xl bg-white/70 ckdrop-blur-md overflow-hidden ring-1 ring-slate-200">
                                <CardContent className="p-6 md:p-8">
                                    {activeTab === 'airtime' && (
                                        <AirtimeForm
                                            wallets={wallets}
                                            onBuy={buyAirtime}
                                            loading={isBuyingAirtime}
                                        />
                                    )}
                                    {activeTab === 'data' && (
                                        <DataForm
                                            dataBundles={data_bundles}
                                            wallets={wallets}
                                            onBuy={buyData}
                                            loading={isBuyingData}
                                        />
                                    )}
                                    {activeTab === 'cable' && (
                                        <CableForm
                                            providers={providers}
                                            packages={packages}
                                            wallets={wallets}
                                            onSub={subCable}
                                            loading={isSubbingCable}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Info / FAQ Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-lg bg-linear-to-br from-indigo-600 to-blue-700 text-white overflow-hidden">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-lg">Special Offers</CardTitle>
                            <CardDescription className="text-indigo-100">Enjoy exclusive discounts on every recharge.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                                <p className="text-2xl font-bold font-heading">2% OFF</p>
                                <p className="text-sm opacity-80">on all Airtime purchases</p>
                            </div>
                            <Button variant="ghost" className="w-full text-white hover:bg-white/10 group">
                                View History <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md ring-1 ring-slate-200">
                        <CardHeader className="p-5 pb-2">
                            <CardTitle className="text-base">Support</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Smartphone size={16} />
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-800">Check Balance</p>
                                    <p className="text-slate-500">Dial *310# for MTN, *232# for others.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                    <Lock size={16} />
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-800">Security</p>
                                    <p className="text-slate-500">Never share your transaction PIN with anyone.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

// --- Sub-components ---

interface NetworkSelectorProps {
    selected: string;
    onSelect: (id: string) => void;
}

function NetworkSelector({ selected, onSelect }: NetworkSelectorProps) {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700">Select Network</Label>
            <div className="grid grid-cols-4 gap-3">
                {NETWORKS.map((network) => (
                    <button
                        key={network.id}
                        type="button"
                        onClick={() => onSelect(network.id)}
                        className={`
                            relative group p-2 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2
                            ${selected === network.id
                                ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                            }
                        `}
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100">
                            {/* In a real app we'd use icons, here we use text/placeholders since images might not exist */}
                            <span
                                className="font-bold text-lg"
                                style={{ color: network.color }}
                            >
                                {network.name[0]}
                            </span>
                        </div>
                        <span className={`text-[10px] md:text-xs font-bold ${selected === network.id ? 'text-primary' : 'text-slate-500'}`}>
                            {network.name}
                        </span>
                        {selected === network.id && (
                            <div className="absolute top-1 right-1">
                                <CheckCircle2 className="w-4 h-4 text-primary fill-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

interface AirtimeFormProps {
    wallets: Wallet[];
    onBuy: any; // Mutation function from RTK Query
    loading: boolean;
}

function AirtimeForm({ wallets, onBuy, loading }: AirtimeFormProps) {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(airtimeSchema),
        defaultValues: { network: '', phoneNo: '', amount: '', wallet: '', pin: '' }
    });

    const network = watch('network');

    const onSubmit = async (data: z.infer<typeof airtimeSchema>) => {
        try {
            const res = await onBuy({
                amount: parseFloat(data.amount),
                network: data.network,
                airtime_phone_no: data.phoneNo,
                airtime_wallet: data.wallet,
                withdrawal_pin: data.pin
            }).unwrap();

            if (res.status === 'success') {
                toast.success('Airtime purchased successfully!');
                reset();
            } else {
                toast.error(res.message || 'Failed to purchase airtime');
            }
        } catch (err: any) {
            toast.error(err.data?.message || 'Something went wrong');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <NetworkSelector selected={network} onSelect={(id) => setValue('network', id)} />
            {errors.network && <p className="text-red-500 text-xs">{errors.network.message}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            id="phone"
                            placeholder="0810 000 0000"
                            className="pl-10 h-12 w-full rounded-xl border-slate-200 focus:ring-blue-500/20"
                            {...register('phoneNo')}
                        />
                    </div>
                    {errors.phoneNo && <p className="text-red-500 text-xs">{errors.phoneNo.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount" className="text-slate-700">Amount (₦)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="e.g 500"
                        className="h-12 w-full rounded-xl border-slate-200 focus:ring-blue-500/20"
                        {...register('amount')}
                    />
                    {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700">Payment Wallet</Label>
                    <Select items={wallets.filter(wallet => wallet?.type === 'direct').map(wallet => ({ label: wallet.type.replace('_', ' ') + ` (₦${wallet.amount.toLocaleString()})`, value: String(wallet.id) }))} onValueChange={(val) => setValue('wallet', val as string)}>
                        <SelectTrigger className="w-full! h-12! rounded-xl border-slate-200 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Wallet</SelectLabel>
                                {wallets.filter(wallet => wallet?.type === 'direct').map(wallet => ({ label: wallet.type.replace('_', ' ') + ` (₦${wallet.amount.toLocaleString()})`, value: String(wallet.id) })).map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* <Select onValueChange={(val) => setValue('wallet', val as string)} items={wallets?.filter(wallet => wallet?.type === 'direct')}>
                        <SelectTrigger className="w-full! h-12! rounded-xl border-slate-200 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            
                            {wallets?.filter(wallet => wallet?.type === 'direct').map((wallet) => (
                                <SelectItem key={wallet.id} value={String(wallet.id)}>
                                    {wallet.type.replace('_', ' ')} (₦{wallet.amount.toLocaleString()})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select> */}
                    {errors.wallet && <p className="text-red-500 text-xs">{errors.wallet.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pin" className="text-slate-700">Transaction PIN</Label>
                    <Input
                        id="pin"
                        type="password"
                        placeholder="****"
                        maxLength={4}
                        className="h-12 w-full rounded-xl border-slate-200 focus:ring-blue-500/20"
                        {...register('pin')}
                    />
                    {errors.pin && <p className="text-red-500 text-xs">{errors.pin.message}</p>}
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Recharge Now'}
            </Button>
        </form>
    );
}

interface DataFormProps {
    dataBundles: Record<string, VtuDataBundle[]>;
    wallets: Wallet[];
    onBuy: any;
    loading: boolean;
}

function DataForm({ dataBundles, wallets, onBuy, loading }: DataFormProps) {

    console.log('DataForm', dataBundles)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(dataSchema),
        defaultValues: { network: '', bundle: '', phoneNo: '', wallet: '', pin: '' }
    });

    const directWallet = useMemo(() => wallets.find(w => w.type === 'direct'), [wallets]);

    useEffect(() => {
        if (directWallet?.id) {
            setValue('wallet', String(directWallet.id));
        }
    }, [directWallet, setValue]);

    const selectedNetwork = watch('network');
    const selectedBundleId = watch('bundle');

    const availableBundles = useMemo(() => {
        return dataBundles[selectedNetwork] || [];
    }, [selectedNetwork, dataBundles]);

    const selectedBundle = useMemo(() => {
        return availableBundles.find((b: VtuDataBundle) => String(b.variation_id) === selectedBundleId);
    }, [availableBundles, selectedBundleId]);

    const onSubmit = async (data: z.infer<typeof dataSchema>) => {
        try {
            const res = await onBuy({
                data_bundle: data.bundle,
                data_network: data.network,
                data_phone_no: data.phoneNo,
                data_wallet: data.wallet,
                data_amount: selectedBundle ? parseFloat(selectedBundle.reseller_price) + 5 : 0,
                withdrawal_pin: data.pin
            }).unwrap();

            if (res.status === 'success') {
                toast.success('Data bundle purchased!');
                reset();
            } else {
                toast.error(res.message || 'Failed to purchase data');
            }
        } catch (err: any) {
            toast.error(err.data?.message || 'Something went wrong');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <NetworkSelector selected={selectedNetwork} onSelect={(id) => {
                setValue('network', id);
                setValue('bundle', '');
            }} />
            {errors.network && <p className="text-red-500 text-xs">{errors.network.message}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700">Data Bundle</Label>
                    <Select 
                        items={availableBundles.map((bundle: VtuDataBundle) => ({ label: `${bundle.data_plan} - ₦${(parseFloat(bundle.reseller_price) + 5).toLocaleString()}`, value: String(bundle.variation_id) }))} 
                        onValueChange={(val) => setValue('bundle', val as string)} 
                        disabled={!selectedNetwork}
                    >
                        <SelectTrigger className="w-full! h-12! rounded-xl border-slate-200 focus:ring-blue-500/20">
                            <SelectValue placeholder={selectedNetwork ? "Choose a bundle" : "Select network first"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl h-60">
                            <SelectGroup>
                                <SelectLabel>Data Bundles</SelectLabel>
                                {availableBundles.map((bundle: VtuDataBundle) => (
                                    <SelectItem key={bundle.variation_id} value={String(bundle.variation_id)}>
                                        {bundle.data_plan} - ₦{(parseFloat(bundle.reseller_price) + 5).toLocaleString()}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.bundle && <p className="text-red-500 text-xs">{errors.bundle.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="d-phone" className="text-slate-700">Phone Number</Label>
                    <Input
                        id="d-phone"
                        placeholder="0810 000 0000"
                        className="h-12 w-full rounded-xl border-slate-200 focus:ring-blue-500/20"
                        {...register('phoneNo')}
                    />
                    {errors.phoneNo && <p className="text-red-500 text-xs">{errors.phoneNo.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700">Payment Wallet</Label>
                    <Select items={wallets.filter(wallet => wallet?.type === 'direct').map(wallet => ({ label: wallet.type.replace('_', ' ') + ` (₦${wallet.amount.toLocaleString()})`, value: String(wallet.id) }))} onValueChange={(val) => setValue('wallet', val as string)}>
                        <SelectTrigger className="w-full! h-12! rounded-xl border-slate-200 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectGroup>
                                <SelectLabel>Wallet</SelectLabel>
                                {wallets.filter(wallet => wallet?.type === 'direct').map(wallet => ({ label: wallet.type.replace('_', ' ') + ` (₦${wallet.amount.toLocaleString()})`, value: String(wallet.id) })).map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.wallet && <p className="text-red-500 text-xs">{errors.wallet.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="d-pin" className="text-slate-700">Transaction PIN</Label>
                    <Input
                        id="d-pin"
                        type="password"
                        placeholder="****"
                        maxLength={4}
                        className="h-12 w-full rounded-xl border-slate-200 focus:ring-blue-500/20"
                        {...register('pin')}
                    />
                    {errors.pin && <p className="text-red-500 text-xs">{errors.pin.message}</p>}
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Buy Bundle'}
            </Button>
        </form>
    );
}

interface CableFormProps {
    providers: string[];
    packages: Record<string, VtuCablePackage[]>;
    wallets: Wallet[];
    onSub: any;
    loading: boolean;
}

function CableForm({ providers, packages, wallets, onSub, loading }: CableFormProps) {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(cableSchema),
        defaultValues: { provider: '', package: '', decoderNo: '', wallet: '', pin: '' }
    });

    const directWallet = useMemo(() => wallets.find(w => w.type === 'direct'), [wallets]);

    useEffect(() => {
        if (directWallet?.id) {
            setValue('wallet', String(directWallet.id));
        }
    }, [directWallet, setValue]);

    const selectedProvider = watch('provider');
    const selectedPkgId = watch('package');

    const availablePkgs = useMemo(() => {
        return packages[selectedProvider] || [];
    }, [selectedProvider, packages]);

    const selectedPkg = useMemo(() => {
        return availablePkgs.find((p: VtuCablePackage) => String(p.variation_id) === selectedPkgId);
    }, [availablePkgs, selectedPkgId]);

    const onSubmit = async (data: z.infer<typeof cableSchema>) => {
        try {
            const res = await onSub({
                package: data.package,
                cabletv: data.provider,
                dish_number: data.decoderNo,
                cable_amount: selectedPkg ? parseFloat(selectedPkg.price) + 5 : 0,
                cable_wallet: data.wallet,
                withdrawal_pin: data.pin
            }).unwrap();

            if (res.status === 'success') {
                toast.success('Cable TV renewed!');
                reset();
            } else {
                toast.error(res.message || 'Failed to sub cable');
            }
        } catch (err: any) {
            toast.error(err.data?.message || 'Something went wrong');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700">TV Provider</Label>
                    <Select onValueChange={(val) => {
                        setValue('provider', val as string);
                        setValue('package', '');
                    }}>
                        <SelectTrigger className="w-full! h-12! rounded-xl border-slate-200 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {providers.map((p: string) => (
                                <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.provider && <p className="text-red-500 text-xs">{errors.provider.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-700">Package</Label>
                    <Select 
                        items={availablePkgs.map((pkg: VtuCablePackage) => ({ label: `${pkg.package_bouquet} - ₦${(parseFloat(pkg.price) + 5).toLocaleString()}`, value: String(pkg.variation_id) }))} 
                        onValueChange={(val) => setValue('package', val as string)} 
                        disabled={!selectedProvider}
                    >
                        <SelectTrigger className="w-full! h-12! rounded-xl border-slate-200 focus:ring-blue-500/20">
                            <SelectValue placeholder={selectedProvider ? "Select Package" : "Select provider first"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl h-64">
                            <SelectGroup>
                                <SelectLabel>Packages</SelectLabel>
                                {availablePkgs.map((pkg: VtuCablePackage) => (
                                    <SelectItem key={pkg.variation_id} value={String(pkg.variation_id)}>
                                        {pkg.package_bouquet} - ₦{(parseFloat(pkg.price) + 5).toLocaleString()}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.package && <p className="text-red-500 text-xs">{errors.package.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="decoder" className="text-slate-700">IUC / SmartCard Number</Label>
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 cursor-pointer hover:scale-110 transition-transform" />
                    <Input
                        id="decoder"
                        placeholder="Enter Number"
                        className="h-12 w-full rounded-xl border-slate-200 pr-10 focus:ring-blue-500/20"
                        {...register('decoderNo')}
                    />
                </div>
                {errors.decoderNo && <p className="text-red-500 text-xs">{errors.decoderNo.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700">Payment Wallet</Label>
                    <Select items={wallets.filter(wallet => wallet?.type === 'direct').map(wallet => ({ label: wallet.type.replace('_', ' ') + ` (₦${wallet.amount.toLocaleString()})`, value: String(wallet.id) }))} onValueChange={(val) => setValue('wallet', val as string)}>
                        <SelectTrigger className="w-full! h-12! rounded-xl border-slate-200 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectGroup>
                                <SelectLabel>Wallet</SelectLabel>
                                {wallets.filter(wallet => wallet?.type === 'direct').map(wallet => ({ label: wallet.type.replace('_', ' ') + ` (₦${wallet.amount.toLocaleString()})`, value: String(wallet.id) })).map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.wallet && <p className="text-red-500 text-xs">{errors.wallet.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="c-pin" className="text-slate-700">Transaction PIN</Label>
                    <Input
                        id="c-pin"
                        type="password"
                        placeholder="****"
                        maxLength={4}
                        className="h-12 w-full rounded-xl border-slate-200 focus:ring-blue-500/20"
                        {...register('pin')}
                    />
                    {errors.pin && <p className="text-red-500 text-xs">{errors.pin.message}</p>}
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-lg font-bold bg-slate-900 hover:bg-slate-800"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Pay Subscription'}
            </Button>
        </form>
    );
}
