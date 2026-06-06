'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, AlertCircle, Fingerprint, Loader2, Camera, RotateCcw } from 'lucide-react';
import { useState, useRef, ChangeEvent, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { User } from 'lucide-react';
import { logout } from '@/store/features/authSlice';

interface KYCModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: unknown) => void;
    isMandatory?: boolean;
    onLogout?: () => void;
}

export default function KYCModal({ isOpen, onClose, onSuccess, isMandatory = false, onLogout }: KYCModalProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [name, setName] = useState(user?.name || '');
    const [bvn, setBvn] = useState('');
    const [passportImage, setPassportImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCameraMode, setIsCameraMode] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [verificationMethod, setVerificationMethod] = useState<'bvn' | 'nin' | 'face' | 'passport'>('bvn');
    const [mounted, setMounted] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);


    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    const dataURLtoFile = (dataurl: string, filename: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPreview(imageSrc);
            const file = dataURLtoFile(imageSrc, 'passport-photo.jpg');
            setPassportImage(file);
            setCameraError(null);
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setPassportImage(null);
        setPreview(null);
        setCameraError(null);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large. Max 5MB allowed.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setPassportImage(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((verificationMethod === 'bvn' || verificationMethod === 'nin') && bvn.length !== 11) {
            toast.error(`Invalid ${verificationMethod.toUpperCase()}. Must be 11 digits.`);
            return;
        }

        if (verificationMethod === 'passport' && bvn.trim().length < 5) {
            toast.error('Please provide a valid passport number.');
            return;
        }

        if (!passportImage) {
            toast.error('Please upload your passport photograph.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);

            let endpoint: string;

            if (verificationMethod === 'bvn') {
                formData.append('bvn', bvn);
                endpoint = '/kyc/verify';
            } else if (verificationMethod === 'nin') {
                formData.append('nin', bvn);
                endpoint = '/kyc/nin-verify';
            } else if (verificationMethod === 'passport') {
                formData.append('passportNumber', bvn.trim());
                endpoint = '/kyc/passport-verify';
            } else {
                endpoint = '/kyc/face-verify';
            }
            
            formData.append('image', passportImage);

            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            toast.success('KYC Information submitted successfully!');
            onSuccess?.(response.data);
            handleClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to submit KYC. Please try again.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setBvn('');
        setPassportImage(null);
        setPreview(null);
        setIsCameraMode(false);
        setCameraError(null);
        onClose();
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            dispatch(logout());
        }
    }

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isMandatory ? undefined : handleClose}
                        className={cn(
                            "fixed inset-0 z-100010 bg-zinc-900/40 backdrop-blur-md",
                            isMandatory ? "cursor-default" : "cursor-pointer"
                        )}
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-100020">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl pointer-events-auto border border-zinc-100 scrollbar-hide"
                        >
                            {/* Header */}
                            <div className="relative p-8 pb-4">
                                {!isMandatory && (
                                    <button
                                        onClick={handleClose}
                                        className="absolute p-2 transition-all right-6 top-6 rounded-2xl bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center text-indigo-600 shadow-inner h-14 w-14 rounded-2xl bg-indigo-50">
                                        <Fingerprint size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black leading-tight tracking-tight text-zinc-900">
                                            Identity Verification
                                        </h3>
                                        <p className="mt-1 text-sm font-bold tracking-widest uppercase text-zinc-400">
                                            Identity Verification
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-7">
                                {/* Name Section */}
                                <div className="space-y-3">
                                    <label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-500">
                                        Full Name (Must match your ID)
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 flex items-center transition-colors left-4 text-zinc-400 group-hover:text-indigo-600">
                                            <User size={18} />
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="Enter full name as on ID"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-12 text-lg font-bold tracking-tight transition-all h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100/50 placeholder:tracking-normal placeholder:font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Verification Method Selector */}
                                <div className="space-y-3">
                                    <label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-500">
                                        Verification Method
                                    </label>
                                    <div className="flex p-1 border bg-zinc-100/80 rounded-2xl border-zinc-200/50">
                                        {(['bvn', 'nin', 'face', 'passport'] as ('bvn' | 'nin' | 'face' | 'passport')[]).map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => {
                                                    setVerificationMethod(method);
                                                    setBvn('');
                                                }}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    verificationMethod === method
                                                        ? "bg-white text-indigo-600 shadow-sm"
                                                        : "text-zinc-500 hover:text-zinc-700"
                                                )}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* BVN / NIN Number Input */}
                                {(verificationMethod === 'bvn' || verificationMethod === 'nin') && (
                                    <div className="space-y-3">
                                        <label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-500">
                                            {verificationMethod === 'bvn' ? 'Bank Verification Number (BVN)' : 'National Identification Number (NIN)'}
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 flex items-center transition-colors left-4 text-zinc-400 group-hover:text-indigo-600">
                                                <AlertCircle size={18} />
                                            </div>
                                            <Input
                                                type="text"
                                                maxLength={11}
                                                placeholder={verificationMethod === 'bvn' ? "Enter 11-digit BVN" : "Enter 11-digit NIN"}
                                                value={bvn}
                                                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                                                className="pl-12 text-lg font-bold tracking-widest transition-all h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100/50 placeholder:tracking-normal placeholder:font-medium"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-400 italic ml-1">
                                            * Your {verificationMethod.toUpperCase()} is required for identity verification and anti-fraud measures.
                                        </p>
                                    </div>
                                )}

                                {/* Passport Number Input */}
                                {verificationMethod === 'passport' && (
                                    <div className="space-y-3">
                                        <label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-500">
                                            International Passport Number
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 flex items-center transition-colors left-4 text-zinc-400 group-hover:text-indigo-600">
                                                <AlertCircle size={18} />
                                            </div>
                                            <Input
                                                type="text"
                                                placeholder="Enter passport number"
                                                value={bvn}
                                                onChange={(e) => setBvn(e.target.value.toUpperCase())}
                                                className="pl-12 text-lg font-bold tracking-widest transition-all h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100/50 placeholder:tracking-normal placeholder:font-medium"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-400 italic ml-1">
                                            * Your passport number is required for identity verification and anti-fraud measures.
                                        </p>
                                    </div>
                                )}

                                {/* ID Upload Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-black leading-none tracking-widest uppercase text-zinc-500">
                                            Passport Photograph
                                        </label>
                                        <div className="flex bg-zinc-100/80 p-0.5 rounded-xl border border-zinc-200/50">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsCameraMode(false);
                                                    handleRetake();
                                                }}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                    !isCameraMode 
                                                        ? "bg-white text-indigo-600 shadow-sm" 
                                                        : "text-zinc-500 hover:text-zinc-700"
                                                )}
                                            >
                                                Upload
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsCameraMode(true);
                                                    handleRetake();
                                                }}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                    isCameraMode 
                                                        ? "bg-white text-indigo-600 shadow-sm" 
                                                        : "text-zinc-500 hover:text-zinc-700"
                                                )}
                                            >
                                                Camera
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        onClick={() => !isCameraMode && !preview && fileInputRef.current?.click()}
                                        className={cn(
                                            "relative group h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                                            preview || isCameraMode
                                                ? "border-indigo-600 bg-indigo-50/20" 
                                                : "border-zinc-200 bg-zinc-50/50 hover:border-indigo-400 hover:bg-white"
                                        )}
                                    >
                                        {!isCameraMode && (
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        )}

                                        {preview ? (
                                            <div className="absolute inset-0">
                                                <Image 
                                                    src={preview} 
                                                    alt="Passport Preview" 
                                                    fill
                                                    unoptimized
                                                    className="object-cover" 
                                                />
                                                <div 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRetake();
                                                    }}
                                                    className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100"
                                                >
                                                    <div className="flex items-center gap-2 p-4 text-xs font-bold text-white border rounded-2xl bg-white/20 backdrop-blur-md border-white/30">
                                                        <RotateCcw size={18} /> Retake
                                                    </div>
                                                </div>
                                                <div className="absolute flex items-center justify-center w-10 h-10 text-white bg-indigo-600 shadow-xl bottom-4 right-4 rounded-2xl">
                                                    <Check size={18} strokeWidth={3} />
                                                </div>
                                            </div>
                                        ) : isCameraMode ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                                <Webcam
                                                    audio={false}
                                                    ref={webcamRef}
                                                    screenshotFormat="image/jpeg"
                                                    videoConstraints={videoConstraints}
                                                    onUserMediaError={() => setCameraError("Cannot access camera")}
                                                    className="object-cover w-full h-full"
                                                />
                                                {cameraError ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                                        <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-500 rounded-2xl bg-red-500/10">
                                                            <Camera size={24} />
                                                        </div>
                                                        <p className="text-xs font-bold tracking-widest text-white uppercase">{cameraError}</p>
                                                        <button 
                                                            type="button"
                                                            onClick={handleRetake}
                                                            className="mt-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest"
                                                        >
                                                            Try Again
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCapture();
                                                        }}
                                                        className="absolute flex items-center justify-center w-16 h-16 transition-all -translate-x-1/2 border-4 border-white rounded-full shadow-2xl bottom-6 left-1/2 bg-white/20 backdrop-blur-md group/btn active:scale-90"
                                                    >
                                                        <div className="w-10 h-10 transition-all bg-white rounded-full shadow-inner group-hover/btn:scale-90" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-center w-16 h-16 transition-transform bg-white border shadow-sm rounded-3xl border-zinc-100 text-zinc-400 group-hover:text-indigo-600 group-hover:scale-110">
                                                    <Upload size={24} />
                                                </div>
                                                <div className="mt-4 text-center">
                                                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Upload Passport</span>
                                                    <span className="block mt-1 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Select a clear portrait image</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Footer / Actions */}
                                <div className="flex gap-4 pt-4">
                                    
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleLogout}
                                            disabled={isSubmitting}
                                            className="flex-1 h-16 rounded-3xl border-zinc-100 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50 transition-all hover:text-zinc-600"
                                        >
                                            Logout
                                        </Button>
                                    
                                    <Button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            ((verificationMethod === 'bvn' || verificationMethod === 'nin') && bvn.length !== 11) ||
                                            (verificationMethod === 'passport' && bvn.trim().length < 5) ||
                                            !passportImage
                                        }
                                        className="flex-2 h-16 rounded-3xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                                            </>
                                        ) : (
                                            'Verify Identity'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
