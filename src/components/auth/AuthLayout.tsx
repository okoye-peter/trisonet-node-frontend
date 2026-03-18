import React from 'react';
import Image from 'next/image';

const AuthLayout = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Visual/Marketing */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
                {/* Background Animations */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 via-transparent to-purple-500/20 opacity-50" />

                {/* Pulsing Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/15 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/15 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '-4s' }} />

                {/* Floating Elements */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-white/5 rounded-full animate-float opacity-20" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-white/5 rounded-3xl animate-float opacity-10" style={{ animationDelay: '-2s' }} />

                {/* Moving Particles/Drift */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-drift opacity-40 shadow-[0_0_10px_white]" />
                    <div className="absolute top-1/4 left-2/3 w-1 h-1 bg-white rounded-full animate-drift opacity-20 shadow-[0_0_8px_white]" style={{ animationDelay: '-10s' }} />
                    <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-drift opacity-30 shadow-[0_0_10px_indigo-400]" style={{ animationDelay: '-20s' }} />
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="invert brightness-0" />
                    <span className="text-xl font-bold tracking-tight">Trisonet</span>
                </div>

                <div className="relative z-10">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed italic text-zinc-300">
                            &ldquo;Trisonet has transformed how we manage our projects and scaled our infrastructure. The speed and security are unparalleled.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-400">&mdash; Engineering Lead, Triso Systems</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
                {/* Subtle Right-side background elements */}
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[100px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[100px] rounded-full animate-pulse-glow" style={{ animationDelay: '-2s' }} />

                <div className="w-full max-w-[400px] space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                    <div className="flex flex-col space-y-2 text-center lg:text-left mb-8">
                        <div className="lg:hidden flex justify-center mb-6">
                            <Image src="/logo.png" alt="Logo" width={60} height={60} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>

                <p className="absolute bottom-8 text-center text-xs text-muted-foreground px-8">
                    By clicking continue, you agree to our{' '}
                    <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
                        Privacy Policy
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
