import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterForm from '@/components/landing/NewsletterForm';

export const metadata: Metadata = {
    title: 'Terms & Conditions | Trisonet - Leading Digital Asset Community',
    description: 'Trisonet Terms and Conditions. Understand your rights and responsibilities when using our platform and metaverse.',
    keywords: ['Terms and Conditions', 'User Agreement', 'Trisonet', 'Metaverse Guidelines'],
};

export default function TermsPage() {
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
                                    <h1>Terms & Conditions</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">Terms & Conditions</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* terms content area start  */}
            <section className="service-details-area pt-150 pb-80">
                <div className="container">
                    <div className="service-details-content wow fadeInUp">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-10 offset-xl-1">
                                    <h4 className="mt-5 mb-3">GENERAL</h4>
                                    <p className="mb-5">
                                        1.1 For the purposes of these terms and conditions (the &quot;Terms&quot;), “we,” “us” and “our” refer to Triune
                                        Christian Welfare Organization. References to Project So Send I You, Tatup International Services
                                        Limited, and other Arms of our organization globally. “You” refers to you, as a user of our websites. 1.2
                                        These Terms will govern your use of trisonet.com and trisonet.org (&quot;our websites&quot;) and our services. Our
                                        websites are intended to provide information about our activities and issues relevant to our objectives.
                                        We reserve the right to change, replace or amend any part of our website at any time without notice.
                                        1.3 Your use of our website constitutes your acceptance of these Terms and your agreement to comply
                                        with them as of the date of your use of our website. Tatup International Services Limited reserves the
                                        right to replace or modify these Terms and any linked policies or notices at any time without notice.
                                    </p>

                                    <h4 className="mt-5 mb-3">REQUIREMENTS TO USE OUR WEBSITE</h4>
                                    <p className="mb-5">
                                        2.1 You must not use our website fraudulently or for any unlawful purpose. You agree that you will not use any resource made available on our website in any manner that is malicious or that
                                        violates any applicable law, or the intellectual property rights of any third party. 2.2 You are responsible
                                        for making all arrangements necessary for you to have access to our website. We reserve the right to
                                        terminate your access to our website or any part of it or to withdraw any of our services at any time,
                                        without notice, for any reason.
                                    </p>

                                    <h4 className="mt-5 mb-3">INTELLECTUAL PROPERTY</h4>
                                    <p className="mb-5">
                                        3.1 Our intellectual property rights in all the contents of all the pages of our website including copyright,
                                        trademarks, names, logos, and database rights are owned by or licensed by Tatup International Services
                                        Limited and are protected by International copyright laws.
                                    </p>

                                    <h4 className="mb-3">PRIVACY AND COOKIES</h4>
                                    <p className="mb-5">
                                        6.1 Tatup International Services Limited is committed to protecting your privacy and we aim to ensure
                                        that any information you give us is held securely and safely. We use cookies to enhance the online
                                        experience of our users and to better understand how our website is used.
                                    </p>

                                    <h4 className="mb-3">MEMORANDUM OF UNDERSTANDING</h4>
                                    <p className="mb-5">
                                        12.1 MEMORANDUM OF UNDERSTANDING BETWEEN TATUP INTERNATIONAL SERVICES LIMITED (HEREINAFTER CALLED THE PRINCIPAL PARTNER) AND EVERY INDIVIDUAL (HEREINAFTER CALLED THE PIONEER PARTNER).
                                    </p>

                                    <div className="mt-5 text-center">
                                        <Link className="grb-btn" href="/contact">Contact Us</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* terms content area end */}

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
