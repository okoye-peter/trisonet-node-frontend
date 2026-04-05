import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterForm from '@/components/landing/NewsletterForm';

export const metadata: Metadata = {
    title: 'Privacy Policy | Trisonet - Leading Digital Asset Community',
    description: 'Trisonet Privacy Policy. Learn how we collect, use, and protect your personal data in our metaverse and services.',
    keywords: ['Privacy Policy', 'Data Protection', 'Trisonet', 'Metaverse Security'],
};

export default function PolicyPage() {
    return (
        <>
            {/* page title area start  */}
            <section className="page-title-area p-relative overflow-hidden">
                <Image
                    src="/assets/img/bg/counter-right-img.png"
                    alt="Page title background"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="container p-relative z-10">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-title-content text-center">
                                <div className="page-title-heading">
                                    <h1>Privacy Policy</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">Privacy Policy</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* policy content area start  */}
            <section className="service-details-area pt-150 pb-80">
                <div className="container">
                    <div className="service-details-img wow fadeInUp">
                        <div className="row">
                            <div className="col-lg-9">
                                <div className="service-details-single-img mb-30 p-relative min-h-[400px]">
                                    <Image
                                        src="/assets/img/service/service-d1.jpg"
                                        alt="Policy main"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            <div className="col-lg-3">
                                <div className="row">
                                    <div className="col-lg-12 col-sm-6">
                                        <div className="service-details-single-img mb-30 p-relative min-h-[185px]">
                                            <Image
                                                src="/assets/img/service/service-d2.jpg"
                                                alt="Policy detail 1"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-sm-6">
                                        <div className="service-details-single-img mb-30 p-relative min-h-[185px]">
                                            <Image
                                                src="/assets/img/service/service-d3.jpg"
                                                alt="Policy detail 2"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="service-details-content wow fadeInUp">
                        <div className="service-details-heading">
                            <h2>Our Commitment to Your Privacy</h2>
                        </div>
                        <p>At Trisonet, we take your privacy seriously. This Policy outlines how we collect, use, and protect your personal data when you interact with our platform, metaverse, and services. We are dedicated to ensuring that your personal information is handled with the utmost care and in accordance with global data protection standards.</p>
                        
                        <div className="row mt-40">
                            <div className="col-xl-9">
                                <h5 className="mb-15">Data Collection & Use</h5>
                                <p className="mb-40">We collect information that helps us provide a better experience, including your contact details, identification for the Partners Identification Module (PIM), and usage data within our metaverse. This data is used solely to enhance our services, provide customer support, and ensure a secure environment for all our citizens.</p>
                                
                                <h5 className="mb-15">Securing Your Information</h5>
                                <p className="mb-40">We implement industry-standard security measures to protect against unauthorized access, alteration, or disclosure of your personal data. Your credentials and transaction histories are encrypted and stored securely within our infrastructure.</p>
                                
                                <h5 className="mb-15">Digital Ownership & Rights</h5>
                                <p className="mb-20">In the Trisonet Metaverse, we respect your digital ownership rights. While we facilitate the platform, your virtual assets and creations are managed under clear digital property guidelines to ensure a fair and transparent economy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* policy content area end */}

            {/* newsletter area start  */}
            <div className="newsletter-area">
                <div className="container">
                    <div className="row wow fadeInUp align-items-center">
                        <div className="col-lg-6">
                            <div className="newsletter-text mb-30">
                                <h4>Subscribe For Newsletter</h4>
                                <p>Get insights on technology trends, product updates, and what&apos;s next — straight to your inbox.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <NewsletterForm />
                        </div>
                    </div>
                </div>
            </div>
            {/* newsletter area end */}
        </>
    );
}
