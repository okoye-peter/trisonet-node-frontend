import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AuthLayout = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4 relative overflow-hidden font-sans">
            {/* Background shapes inspired by the template */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#6639ff] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#ffc400] rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-[1100px] bg-white rounded-xl shadow-2xl overflow-hidden grid lg:grid-cols-2 relative z-10 border border-zinc-100">
                {/* Left Side - Visual/Branding */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-[#040021] text-white relative">
                    {/* Background Overlay Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("/assets/img/bg/counter-right-img.png")', backgroundSize: 'cover' }} />
                    <div className="absolute inset-0 bg-[#6639ff]/40 mix-blend-multiply" />
                    
                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg">
                                <Image src="/assets/img/logo/logo.png" alt="Logo" width={40} height={40} style={{ height: 'auto' }} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white uppercase italic">Trisonet</span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="inline-block px-4 py-1 bg-[#6639ff] text-white text-xs font-bold uppercase tracking-widest rounded-full">
                            Leading in Digital Assets
                        </div>
                        <h2 className="text-4xl font-extrabold leading-tight text-white uppercase">
                            Empowering Your <span className="text-[#ffc400]">Digital Future</span>
                        </h2>
                        <p className="text-zinc-300 text-lg leading-relaxed">
                            Join over 53,000+ partners globally. Access metaverse solutions, digital logistics, and sustainable economy building.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <div className="flex -space-x-2">
                                {['team1.png', 'team2.jpg', 'team3.jpg', 'team4.jpg'].map((img, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#040021] overflow-hidden bg-zinc-800">
                                        <Image src={`/assets/img/team/${img}`} alt="User" width={32} height={32} style={{ height: 'auto' }} />
                                    </div>
                                ))}
                            </div>
                            <span>Joined by 53k+ partners</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex flex-col p-8 lg:p-16 justify-center bg-white">
                    <div className="w-full max-w-[400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="lg:hidden flex justify-center mb-8">
                            <Image src="/assets/img/logo/logo.png" alt="Logo" width={60} height={60} style={{ height: 'auto' }} />
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-[#040021] uppercase tracking-tight">{title}</h1>
                            <p className="text-[#8f98a8] text-sm leading-relaxed">{description}</p>
                        </div>

                        <div className="auth-form-container">
                            {children}
                        </div>

                        <div className="pt-6 border-t border-zinc-100">
                            <p className="text-center text-xs text-[#8f98a8] leading-relaxed">
                                By continuing, you agree to our{' '}
                                <Link href="/terms" className="text-[#6639ff] font-semibold hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/policy" className="text-[#6639ff] font-semibold hover:underline">
                                    Privacy Policy
                                </Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Template-style decorative element */}
            <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-[#6639ff]/5 rounded-full border border-[#6639ff]/10" />
        </div>
    );
};

export default AuthLayout;
