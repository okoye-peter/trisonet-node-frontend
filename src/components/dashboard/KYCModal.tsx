'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, AlertCircle, Fingerprint, Loader2, Camera, RotateCcw } from 'lucide-react';
import { useState, useRef, ChangeEvent, useCallback } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import api from '@/lib/axios';

interface KYCModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: unknown) => void;
    isMandatory?: boolean;
}

export default function KYCModal({ isOpen, onClose, onSuccess, isMandatory = false }: KYCModalProps) {
    const [bvn, setBvn] = useState('');
    const [passportImage, setPassportImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCameraMode, setIsCameraMode] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);

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
        
        if (bvn.length !== 11) {
            toast.error('Invalid BVN. Must be 11 digits.');
            return;
        }

        if (!passportImage) {
            toast.error('Please upload your passport photograph.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('bvn', bvn);
            formData.append('image', passportImage);

            const response = await api.post('/kyc/verify', formData, {
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={isMandatory ? undefined : handleClose}
                        className={cn(
                            "fixed inset-0 z-60 bg-zinc-900/40 backdrop-blur-md",
                            isMandatory ? "cursor-default" : "cursor-pointer"
                        )}
                    />
                    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl pointer-events-auto border border-zinc-100"
                        >
                            {/* Header */}
                            <div className="relative p-8 pb-4">
                                {!isMandatory && (
                                    <button
                                        onClick={handleClose}
                                        className="absolute right-6 top-6 rounded-2xl bg-zinc-50 p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all active:scale-95"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                        <Fingerprint size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight text-zinc-900 leading-tight">Identity Verification</h3>
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">KYC Level 2</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-8">
                                {/* BVN Section */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">
                                        Bank Verification Number (BVN)
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center text-zinc-400 group-hover:text-indigo-600 transition-colors">
                                            <AlertCircle size={18} />
                                        </div>
                                        <Input
                                            type="text"
                                            maxLength={11}
                                            placeholder="Enter 11-digit BVN"
                                            value={bvn}
                                            onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                                            className="h-14 pl-12 rounded-2xl bg-zinc-50/50 border-zinc-100 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100/50 transition-all text-lg font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium"
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-400 italic ml-1">
                                        * Your BVN is required for identity verification and anti-fraud measures.
                                    </p>
                                </div>

                                {/* ID Upload Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest leading-none">
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
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-2 font-bold text-xs">
                                                        <RotateCcw size={18} /> Retake
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 right-4 h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl">
                                                    <Check size={18} strokeWidth={3} />
                                                </div>
                                            </div>
                                        ) : isCameraMode ? (
                                            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                                                <Webcam
                                                    audio={false}
                                                    ref={webcamRef}
                                                    screenshotFormat="image/jpeg"
                                                    videoConstraints={videoConstraints}
                                                    onUserMediaError={() => setCameraError("Cannot access camera")}
                                                    className="h-full w-full object-cover"
                                                />
                                                {cameraError ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                                                            <Camera size={24} />
                                                        </div>
                                                        <p className="text-xs font-bold text-white uppercase tracking-widest">{cameraError}</p>
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
                                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border-4 border-white flex items-center justify-center group/btn active:scale-90 transition-all shadow-2xl"
                                                    >
                                                        <div className="h-10 w-10 rounded-full bg-white transition-all group-hover/btn:scale-90 shadow-inner" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="h-16 w-16 rounded-3xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
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
                                <div className="pt-4 flex gap-4">
                                    {!isMandatory && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClose}
                                            disabled={isSubmitting}
                                            className="flex-1 h-16 rounded-3xl border-zinc-100 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50 transition-all hover:text-zinc-600"
                                        >
                                            Later
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || bvn.length !== 11 || !passportImage}
                                        className="flex-2 h-16 rounded-3xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
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
        </AnimatePresence>
    );
}
