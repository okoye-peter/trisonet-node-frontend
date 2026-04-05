import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterForm from '@/components/landing/NewsletterForm';

export const metadata: Metadata = {
    title: 'Services | Trisonet - Leading Digital Asset Community',
    description: 'Explore Trisonet services including PIM, Agriculture, Health, Eatery, E-Commerce, and Logistics in our 3D virtual world.',
    keywords: ['Trisonet Services', 'Digital Asset Management', 'Agriculture technology', 'E-Commerce', 'Logistics'],
};

export default function ServicesPage() {
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
                                    <h1>Services</h1>
                                </div>
                                <nav className="grb-breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">Services</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* page title area end */}

            {/* service box area  */}
            <section className="service-box-area service-box-area-main pt-150 pb-80">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-4 col-md-6">
                            <div className="service-box-single mb-40">
                                <div className="service-box-content st-1">
                                    <div className="service-box-content-icon st-1">
                                        <i className="flaticon-idea"></i>
                                    </div>
                                    <div className="service-box-content-text">
                                        <h5><Link href="/services">Partners Identification Module (PIM)</Link></h5>
                                        <p>The Partners Identification Module (PIM) is a secure and intelligent digital system designed to streamline partner onboarding, verification, and identity management within modern business ecosystems.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-box-single mb-40">
                                <div className="service-box-content st-1">
                                    <div className="service-box-content-icon st-1">
                                        <i className="flaticon-consultation"></i>
                                    </div>
                                    <div className="service-box-content-text">
                                        <h5><Link href="/services">Agriculture / Farming</Link></h5>
                                        <p>Our Agriculture and Farming Solutions are designed to empower farmers and agribusinesses with smart, technology-driven tools that improve productivity.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-box-single mb-40">
                                <div className="service-box-content st-1">
                                    <div className="service-box-content-icon st-1">
                                        <i className="flaticon-healthcare"></i>
                                    </div>
                                    <div className="service-box-content-text">
                                        <h4><Link href="/services">Health</Link></h4>
                                        <p>Our platform supports herbal partner identification, product traceability, digital records, and verified practitioner networks, ensuring quality standards.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-box-single mb-40">
                                <div className="service-box-content st-1">
                                    <div className="service-box-content-icon st-1">
                                        <i className="flaticon-analytics"></i>
                                    </div>
                                    <div className="service-box-content-text">
                                        <h4><Link href="/services">Eatery</Link></h4>
                                        <p>TrisoNet Eatery is a modern, technology-powered food and hospitality platform designed to deliver fresh, affordable, and high-quality meals.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-box-single mb-40">
                                <div className="service-box-content st-1">
                                    <div className="service-box-content-icon st-1">
                                        <i className="flaticon-digital-marketing"></i>
                                    </div>
                                    <div className="service-box-content-text">
                                        <h4><Link href="/services">E-Commerce</Link></h4>
                                        <p>TrisoNet E-Commerce is a secure, digital marketplace designed to connect buyers, sellers, and business partners within a trusted ecosystem.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="service-box-single mb-40">
                                <div className="service-box-content st-1">
                                    <div className="service-box-content-icon st-1">
                                        <i className="flaticon-web-maintenance"></i>
                                    </div>
                                    <div className="service-box-content-text">
                                        <h4><Link href="/services">Logistics</Link></h4>
                                        <p>TrisoNet Logistics is a smart, technology-driven logistics platform designed to deliver fast, secure, and transparent movement of goods.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* service box end */}

            {/* partners area start  */}
            <section className="partners-area pb-80">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-6">
                            <div className="partners-content mb-40">
                                <div className="section-title mb-35">
                                    <h4>The fastest way to grow your wealth and Child’s right to education Digital-Gkwth</h4>
                                </div>
                                <p>TrisoNet Community is a Community where every citizen is wealthy through the power of TrisoNet Asset (Gkwth). sign up either as a basic or an infant citizen.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="partners-logo pl-100">
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="single-partner">
                                            <a href="#"><Image src="/assets/img/about/p.jpg" alt="" width={300} height={200} className="w-full h-auto" /></a>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="single-partner text-end">
                                            <a href="#"><Image src="/assets/img/about/child1.jpg" alt="" width={300} height={200} className="w-full h-auto" /></a>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="single-partner text-center">
                                            <a href="#"><Image src="/assets/img/about/chi.jpg" alt="" width={600} height={400} className="w-full h-auto mx-auto" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* partners area end */}

            {/* hire area start  */}
            <section className="hire-area p-relative overflow-hidden">
                <Image
                    src="/assets/img/bg/hire-bg.jpg"
                    alt="Hire background"
                    fill
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="container p-relative z-10">
                    <div className="row wow fadeInUp justify-content-center">
                        <div className="col-lg-8 col-md-11">
                            <div className="hire-content text-center">
                                <div className="section-title mb-55">
                                    <h2 className="white-color">Become a Patron in Trisonet</h2>
                                </div>
                                <div className="hire-btn">
                                    <Link href="/contact" className="grb-btn">CONTACT US.</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* hire area end  */}

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
