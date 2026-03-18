'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/10">
            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Trisonet Logo" width={32} height={32} className="object-contain" />
                        <span className="text-xl font-bold tracking-tight">Trisonet</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" render={<Link href="/login" />} className="hidden sm:inline-flex">
                            Login
                        </Button>
                        <Button render={<Link href="/register" />}>
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 lg:py-32">
                    {/* Background Elements */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full" />
                    </div>

                    <div className="container relative z-10 mx-auto px-4 text-center sm:px-8">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 animate-fade-in">
                            <span className="mr-2">✨</span>
                            <span>Next Generation Infrastructure</span>
                        </div>

                        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Build and Scale your <br className="hidden sm:block" />
                            Projects with Trisonet
                        </h1>

                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10 leading-relaxed">
                            The ultimate platform for modern engineering teams. Real-time logging,
                            automated regions management, and high-performance file processing.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold" render={<Link href="/register" />}>
                                Start Building <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold" render={<Link href="/login" />}>
                                Sign In
                            </Button>
                        </div>

                        {/* Logo Row */}
                        <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40 grayscale transition-all hover:grayscale-0">
                            <Image src="/logo.png" alt="Partner 1" width={100} height={30} className="h-8 w-auto object-contain" />
                            <Image src="/logo.png" alt="Partner 2" width={100} height={30} className="h-8 w-auto object-contain" />
                            <Image src="/logo.png" alt="Partner 3" width={100} height={30} className="h-8 w-auto object-contain" />
                            <Image src="/logo.png" alt="Partner 4" width={100} height={30} className="h-8 w-auto object-contain" />
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="bg-muted/30 py-24">
                    <div className="container mx-auto px-4 sm:px-8">
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Shield, title: "Enterprise Security", desc: "Built-in protection for all your sensitive data and infrastructure." },
                                { icon: Zap, title: "Blazing Speed", desc: "Optimized pipelines that handle millions of requests with sub-millisecond latency." },
                                { icon: Globe, title: "Global Regions", desc: "Deploy your code worldwide with a single click using our region manager." },
                                { icon: Layers, title: "Modular Architecture", desc: "Scale components independently with our cloud-native design patterns." }
                            ].map((feature, i) => (
                                <div key={i} className="group rounded-2xl border border-border bg-background p-8 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border py-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground sm:px-8">
                    <p>© 2026 Trisonet. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
