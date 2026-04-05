import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/landing/ContactForm';
import NewsletterForm from '@/components/landing/NewsletterForm';

export const metadata: Metadata = {
    title: 'Contact Us | Trisonet - Leading Digital Asset Community',
    description: 'Get in touch with Trisonet Metaverse. We are available for your personal and business financial support.',
    keywords: ['Contact Trisonet', 'Support', 'Customer Service', 'Metaverse Help'],
};

export default function ContactPage() {
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
                                    <h1>Contact Us</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">Contact Us</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* contact area start  */}
            <div className="contact-area pt-145 pb-120">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-4">
                            <div className="contact-address">
                                <div className="contact-heading">
                                    <h4>Direct Contact Us</h4>
                                </div>
                                <ul className="contact-address-list">
                                    <li>
                                        <div className="contact-list-icon">
                                            <i className="fas fa-phone-alt"></i>
                                        </div>
                                        <div className="contact-list-text">
                                            <span><a href="tel:+2349078168453">+2349078168453</a></span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="contact-list-icon st-3">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div className="contact-list-text">
                                            <span><a href="mailto:info@trisonet.com">info@trisonet.com</a></span>
                                            <span><a href="mailto:trisonetasset@gmail.com">trisonetasset@gmail.com</a></span>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="contact-list-icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                        <div className="contact-list-text">
                                            <span><a href="#">41 Eric Moore Street, Wemabod Estate Ikeja, Lagos</a></span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="get-in-touch">
                                <div className="contact-heading">
                                    <h4>Get in Touch</h4>
                                </div>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
